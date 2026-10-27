import { App } from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import {
  FREE_TIER_ALARM_LIMIT,
  MonitoringStack,
} from "../lib/monitoring-stack";

const synth = () =>
  Template.fromStack(
    new MonitoringStack(new App(), "test-monitoring", {
      name: "monitoring",
      alertEmail: "alerts@example.com",
      httpApiId: "abc123",
      distributionId: "E123",
      monthlyBudgetUsd: 10,
      environment: "prod",
      region: "usea1",
      product: "rhgc",
      appName: "Test",
    })
  );

test("stays within the CloudWatch free tier alarm limit", () => {
  const alarms = Object.keys(synth().findResources("AWS::CloudWatch::Alarm"));
  expect(alarms.length).toBeGreaterThan(0);
  expect(alarms.length).toBeLessThanOrEqual(FREE_TIER_ALARM_LIMIT);
});

test("every alarm notifies the alert topic", () => {
  const template = synth();
  const alarms = Object.values(
    template.findResources("AWS::CloudWatch::Alarm")
  );
  for (const alarm of alarms) {
    expect(alarm.Properties.AlarmActions).toHaveLength(1);
  }
  template.resourceCountIs("AWS::SNS::Subscription", 1);
});

test("creates one monthly actual-spend budget", () => {
  synth().hasResourceProperties("AWS::Budgets::Budget", {
    Budget: { TimeUnit: "MONTHLY", BudgetType: "COST" },
  });
});
