import { Stack } from "aws-cdk-lib";
import { StackProps } from "../types/stack-props";
import { Construct } from "constructs";
import {
  BlockPublicAccess,
  Bucket,
  BucketAccessControl,
  BucketEncryption,
} from "aws-cdk-lib/aws-s3";
import { awsResourceNames, resourceName } from "../modules/common";
import {
  Distribution,
  HttpVersion,
  SecurityPolicyProtocol,
  ViewerProtocolPolicy,
} from "aws-cdk-lib/aws-cloudfront";
import { S3BucketOrigin } from "aws-cdk-lib/aws-cloudfront-origins";

interface WebStackProps extends StackProps {
  name: string;
}

export class WebStack extends Stack {
  readonly cloudFrontDistribution: Distribution;
  readonly s3bucket: Bucket;

  constructor(scope: Construct, id: string, props: WebStackProps) {
    super(scope, id, props);
    const { name, ...baseProps } = props;

    const s3bucketName = resourceName(baseProps, name);
    const s3bucket = new Bucket(
      this,
      `${s3bucketName}-${awsResourceNames().bucket}`,
      {
        bucketName: s3bucketName,
        blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
        accessControl: BucketAccessControl.PRIVATE,
        enforceSSL: true,
        encryption: BucketEncryption.S3_MANAGED,
      }
    );

    const cloudFrontDistributionName = resourceName(baseProps, name);
    const cloudFrontDistribution = new Distribution(
      this,
      `${cloudFrontDistributionName}-${awsResourceNames().distribution}`,
      {
        httpVersion: HttpVersion.HTTP2_AND_3,
        minimumProtocolVersion: SecurityPolicyProtocol.TLS_V1_2_2021,
        enabled: true,
        defaultBehavior: {
          origin: S3BucketOrigin.withOriginAccessControl(s3bucket),
          viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        },
      }
    );

    this.s3bucket = s3bucket;
    this.cloudFrontDistribution = cloudFrontDistribution;
  }
}
