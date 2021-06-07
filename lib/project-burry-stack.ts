import * as cdk from '@aws-cdk/core';
import {Function, Code, Runtime, Tracing} from "@aws-cdk/aws-lambda";
import {Duration} from "@aws-cdk/core";

export class ProjectBurryStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
    const testFunction = new Function(this, "TestFunction", {
      runtime: Runtime.NODEJS_14_X,
      handler: 'app.handler',
      timeout: Duration.minutes(1),
      code: Code.fromAsset('src'),
      tracing: Tracing.ACTIVE,
      environment: {
        'SHOPPING_LIST_TABLE_ID': "e7023a29331b4937bb99968fa6db3e0c",
        'NOTION_TOKEN': 'secret_xXcxXTfy0GTt4EykhQTtNCIa8h7V0Kah8ewE38jDy3v'
      }
    })
  }
}
