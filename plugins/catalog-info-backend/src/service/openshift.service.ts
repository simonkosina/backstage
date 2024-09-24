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

import { OpenShiftAPI, TemplateListSchema } from './types';

export class OpenShiftService implements OpenShiftAPI {
  baseUrl: string;
  authToken: string;

  constructor(baseUrl: string, authToken: string) {
    this.baseUrl = baseUrl;
    this.authToken = authToken;
  }

  async getTemplates(): Promise<TemplateListSchema> {
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

      return response.json() as Promise<TemplateListSchema>;
    });
  }
}
