import { Duration, Stack } from "aws-cdk-lib";
import { Construct } from "constructs";
import {
  Alarm,
  ComparisonOperator,
  Metric,
  TreatMissingData,
} from "aws-cdk-lib/aws-cloudwatch";
import { SnsAction } from "aws-cdk-lib/aws-cloudwatch-actions";
import { Topic } from "aws-cdk-lib/aws-sns";
import { EmailSubscription } from "aws-cdk-lib/aws-sns-subscriptions";
import { CfnBudget } from "aws-cdk-lib/aws-budgets";
import { StackProps } from "../types/stack-props";
import { resourceName } from "../modules/common";

// CloudWatch's free tier is 10 alarms per account. Keep this list small;
// test/monitoring-stack.test.ts fails if it grows past the limit.
export const FREE_TIER_ALARM_LIMIT = 10;

interface MonitoringStackProps extends StackProps {
  name: string;
  alertEmail: string;
  httpApiId: string;
  distributionId: string;
  monthlyBudgetUsd: number;
}

export class MonitoringStack extends Stack {
  constructor(scope: Construct, id: string, props: MonitoringStackProps) {
    super(scope, id, props);
    const {
      name,
      alertEmail,
      httpApiId,
      distributionId,
      monthlyBudgetUsd,
      ...baseProps
    } = props;
    const prefix = resourceName(baseProps, name);

    const topic = new Topic(this, "alerts-topic", {
      topicName: `${prefix}-alerts`,
      displayName: `${baseProps.appName} alerts`,
    });
    topic.addSubscription(new EmailSubscription(alertEmail));
    const notify = new SnsAction(topic);

    const fiveMinutes = Duration.minutes(5);
    const alarm = (
      id: string,
      description: string,
      metric: Metric,
      threshold: number
    ) => {
      const created = new Alarm(this, id, {
        alarmName: `${prefix}-${id}`,
        alarmDescription: description,
        metric,
        threshold,
        evaluationPeriods: 1,
        comparisonOperator:
          ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
        treatMissingData: TreatMissingData.NOT_BREACHING,
      });
      created.addAlarmAction(notify);
      created.addOkAction(notify);
    };

    // Lambda metrics without dimensions cover every function in the account.
    alarm(
      "lambda-errors",
      "Lambda functions (all environments) are failing.",
      new Metric({
        namespace: "AWS/Lambda",
        metricName: "Errors",
        statistic: "Sum",
        period: fiveMinutes,
      }),
      5
    );
    alarm(
      "lambda-throttles",
      "Lambda calls are being throttled (account concurrency limit reached).",
      new Metric({
        namespace: "AWS/Lambda",
        metricName: "Throttles",
        statistic: "Sum",
        period: fiveMinutes,
      }),
      10
    );
    alarm(
      "api-5xx",
      "The HTTP API is returning server errors.",
      new Metric({
        namespace: "AWS/ApiGateway",
        metricName: "5xx",
        dimensionsMap: { ApiId: httpApiId },
        statistic: "Sum",
        period: fiveMinutes,
      }),
      5
    );
    // The stage throttle caps traffic at 15,000 requests per 5 minutes;
    // this fires well before that, on sustained unusual traffic.
    alarm(
      "api-traffic",
      "Unusually high HTTP API traffic (possible abuse, cost risk).",
      new Metric({
        namespace: "AWS/ApiGateway",
        metricName: "Count",
        dimensionsMap: { ApiId: httpApiId },
        statistic: "Sum",
        period: fiveMinutes,
      }),
      10000
    );
    alarm(
      "cdn-traffic",
      "Unusually high CloudFront traffic (possible abuse, cost risk).",
      new Metric({
        namespace: "AWS/CloudFront",
        metricName: "Requests",
        dimensionsMap: { DistributionId: distributionId, Region: "Global" },
        statistic: "Sum",
        period: fiveMinutes,
      }),
      50000
    );

    // Account-wide monthly budget on actual spend (the first 2 budgets are free).
    new CfnBudget(this, "monthly-budget", {
      budget: {
        budgetName: `${prefix}-monthly`,
        budgetType: "COST",
        timeUnit: "MONTHLY",
        budgetLimit: { amount: monthlyBudgetUsd, unit: "USD" },
      },
      notificationsWithSubscribers: [50, 100].map((threshold) => ({
        notification: {
          notificationType: "ACTUAL",
          comparisonOperator: "GREATER_THAN",
          threshold,
          thresholdType: "PERCENTAGE",
        },
        subscribers: [{ subscriptionType: "EMAIL", address: alertEmail }],
      })),
    });
  }
}
