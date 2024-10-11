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
import React from 'react';
import {
  Header,
  Page,
  Content,
  ContentHeader,
  HeaderLabel,
  SupportButton,
  InfoCard,
  HeaderTabs,
} from '@backstage/core-components';
import { Templates } from '../Templates';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Route } from 'react-router-dom';
import {
  instancesSubRouteRef,
  indexRouteRef,
  templatesSubRouteRef,
  templateInstantiationSubRouteRef,
} from '../../routes';
import { useRouteRef } from '@backstage/core-plugin-api';
import { FlatRoutes } from '@backstage/core-app-api';
import { TemplateInstantiation } from '../TemplateInstantiation';
import { Instances } from '../Instances';

type Tab = {
  id: string;
  label: string;
};

function getSelectedIndex(pathname: string, tabs: Tab[]): number {
  const pathParts = pathname.split('/').filter(part => part.trim() !== '');

  // Default to first tab in the list
  if (pathParts.length < 2) {
    return 0;
  }

  const id = `/${pathParts[1]}`;
  const selectedIndex = tabs.findIndex(tab => tab.id === id);

  return selectedIndex < 0 ? 0 : selectedIndex;
}

export const IndexPage = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const getIndexPath = useRouteRef(indexRouteRef);

  const tabs: Tab[] = [
    { id: templatesSubRouteRef.path, label: 'Templates' },
    { id: templateInstantiationSubRouteRef.path, label: 'Instances' },
  ];

  // TODO: Error page when path doesn't exist
  return (
    <Page themeId="tool">
      <Header title="Welcome to catalog-info!" subtitle="Optional subtitle">
        <HeaderLabel label="Owner" value="Team X" />
        <HeaderLabel label="Lifecycle" value="Alpha" />
        <SupportButton>A description of your plugin goes here.</SupportButton>
      </Header>
      <HeaderTabs
        tabs={tabs}
        selectedIndex={getSelectedIndex(pathname, tabs)}
        onChange={index => {
          if (tabs[index]) {
            navigate(`${getIndexPath()}${tabs[index].id}`);
          }
        }}
      />
      <FlatRoutes>
        <Route path={templatesSubRouteRef.path} element={<Templates />} />
        <Route
          path={templateInstantiationSubRouteRef.path}
          element={<TemplateInstantiation />}
        />
        <Route path={instancesSubRouteRef.path} element={<Instances />} />
        <Route
          path="/"
          element={
            <Navigate
              to={`${getIndexPath()}/${templatesSubRouteRef.path}`}
              replace
            />
          }
        />
      </FlatRoutes>
    </Page>
  );
};
