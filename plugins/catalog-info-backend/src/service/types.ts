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

export interface OpenShiftAPI {
  getTemplates(): Promise<TemplateListSchema>;
}

export type TemplateListSchema = {
  apiVersion: string;
  items: Template[];
  kind: string;
  metadata: ListMeta;
};

// https://docs.openshift.com/container-platform/4.16/rest_api/template_apis/template-template-openshift-io-v1.html#template-template-openshift-io-v1
export type Template = {
  apiVersion: string;
  kind: string;
  labels: { [key: string]: string };
  message: string;
  metadata: ObjectMeta;
  objects: RawExtension[];
  parameters: { [key: string]: string | boolean }[];
  // TODO: parameters[]
};

// https://docs.openshift.com/container-platform/4.16/rest_api/objects/index.html#io.k8s.apimachinery.pkg.apis.meta.v1.ListMeta
export type ListMeta = {
  continue: string;
  remainingItemCount: number;
  resourceVersion: string;
  selfLink: string;
};

// https://docs.openshift.com/container-platform/4.16/rest_api/objects/index.html#io.k8s.apimachinery.pkg.apis.meta.v1.ObjectMeta
export type ObjectMeta = {
  annotations: { [key: string]: string };
  creationTimestamp: string;
  deletionGracePeriodSeconds: number;
  deletionTimestamp: string;
  finalizers: string[];
  generateName: string;
  generation: number;
  labels: { [key: string]: string };
  managedFields: ManagedFieldsEntry[];
  name: string;
  namespace: string;
  ownerReferences: OwnerReference[];
  resourceVersion: string;
  selfLink: string;
  uid: string;
};

// TODO:
// https://docs.openshift.com/container-platform/4.16/rest_api/objects/index.html#io.k8s.apimachinery.pkg.runtime.RawExtension
export type RawExtension = object;

// TODO:
// https://docs.openshift.com/container-platform/4.16/rest_api/objects/index.html#io.k8s.apimachinery.pkg.apis.meta.v1.ManagedFieldsEntry
export type ManagedFieldsEntry = object;

// TODO:
// https://docs.openshift.com/container-platform/4.16/rest_api/objects/index.html#io.k8s.apimachinery.pkg.apis.meta.v1.OwnerReference
export type OwnerReference = object;
