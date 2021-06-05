import * as cdk from '@aws-cdk/core';
import {Function, Code, Runtime, Tracing} from "@aws-cdk/aws-lambda";

export class ProjectBurryStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
    const testFunction = new Function(this, "TestFunction", {
      runtime: Runtime.NODEJS_14_X,
      handler: 'app.handler',
      code: Code.fromAsset('src'),
      tracing: Tracing.ACTIVE,
      environment: {
        'SHOPPING_LIST_TABLE_ID': "test"
      }
    })
  }
}
