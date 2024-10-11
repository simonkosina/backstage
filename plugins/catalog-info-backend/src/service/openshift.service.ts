/*
 * Copyright 2024 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import {
  OpenShiftAPI,
  TemplateList,
  Template,
  Secret,
  TemplateInstance,
  PartialSecret,
  PartialTemplateInstance,
  DeploymentConfigList,
} from './types';

export class OpenShiftService implements OpenShiftAPI {
  baseUrl: string;
  authToken: string;

  constructor(baseUrl: string, authToken: string) {
    this.baseUrl = baseUrl;
    this.authToken = authToken;
  }

  async getTemplates(): Promise<TemplateList> {
    return await fetch(
      `${this.baseUrl}/apis/template.openshift.io/v1/templates`,
      {
        headers: {
          Authorization: `Bearer ${this.authToken}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      },
    ).then(response => {
      if (!response.ok) {
        throw new Error(response.statusText);
      }

      return response.json() as Promise<TemplateList>;
    });
  }

  async getTemplate(namespace: string, name: string): Promise<Template> {
    return await fetch(
      `${this.baseUrl}/apis/template.openshift.io/v1/namespaces/${namespace}/templates/${name}`,
      {
        headers: {
          Authorization: `Bearer ${this.authToken}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      },
    ).then(response => {
      if (!response.ok) {
        throw new Error(response.statusText);
      }

      return response.json() as Promise<Template>;
    });
  }

  async getDeploymentConfigs(namespace: string): Promise<DeploymentConfigList> {
    return await fetch(
      `${this.baseUrl}/apis/apps.openshift.io/v1/namespaces/${namespace}/deploymentconfigs`,
      {
        headers: {
          Authorization: `Bearer ${this.authToken}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      },
    ).then(response => {
      if (!response.ok) {
        throw new Error(response.statusText);
      }

      return response.json() as Promise<DeploymentConfigList>;
    });
  }

  async createSecret(
    namespace: string,
    secret: PartialSecret,
    dryRun?: boolean,
  ): Promise<Secret> {
    const url = new URL(
      `${this.baseUrl}/api/v1/namespaces/${namespace}/secrets`,
    );

    if (dryRun) {
      url.searchParams.append('dryRun', 'All');
    }

    return await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.authToken}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(secret),
    }).then(response => {
      if (!response.ok) {
        throw new Error(response.statusText);
      }

      return response.json() as Promise<Secret>;
    });
  }

  async createTemplateInstance(
    namespace: string,
    templateInstance: PartialTemplateInstance,
    dryRun?: boolean,
  ): Promise<TemplateInstance> {
    const url = new URL(
      `${this.baseUrl}/apis/template.openshift.io/v1/namespaces/${namespace}/templateinstances`,
    );

    if (dryRun) {
      url.searchParams.append('dryRun', 'All');
    }

    return await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.authToken}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(templateInstance),
    }).then(response => {
      if (!response.ok) {
        throw new Error(response.statusText);
      }

      return response.json() as Promise<TemplateInstance>;
    });
  }
}
