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
import { createSubRouteRef, createRouteRef } from '@backstage/core-plugin-api';

// TODO: Might want to define other routes for /templates, /second-tab ... and use the paths in IndexPage component
export const indexRouteRef = createRouteRef({
  id: 'catalog-info',
});

export const templatesSubRouteRef = createSubRouteRef({
  id: 'catalog-info-templates',
  parent: indexRouteRef,
  path: '/templates',
});

export const clustersSubRouteRef = createSubRouteRef({
  id: 'catalog-info-clusters',
  parent: indexRouteRef,
  path: '/clusters',
});

export const itemOrderSubRouteRef = createSubRouteRef({
  id: 'catalog-info-item-order',
  parent: indexRouteRef,
  path: '/templates/order/:namespace/:name',
});
