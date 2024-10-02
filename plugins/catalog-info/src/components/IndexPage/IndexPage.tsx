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
import React, { PropsWithChildren } from 'react';
import {
  Header,
  Page,
  Content,
  ContentHeader,
  HeaderLabel,
  SupportButton,
  TabbedLayout,
  InfoCard,
} from '@backstage/core-components';
import { CatalogItems } from '../CatalogItems';
import { Navigate } from 'react-router-dom';
import { Route, Routes } from 'react-router-dom';
import { indexRouteRef } from '../../routes';
import { useRouteRef } from '@backstage/core-plugin-api';

const Wrapper = ({ children }: PropsWithChildren<{}>) => {
  const getIndexPath = useRouteRef(indexRouteRef);

  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to={`${getIndexPath()}/templates`} replace />}
      />
      <Route path="/*" element={<>{children}</>} />
    </Routes>
  );
};

export const IndexPage = () => {
  return (
    <Wrapper>
      <Page themeId="tool">
        <Header title="Welcome to catalog-info!" subtitle="Optional subtitle">
          <HeaderLabel label="Owner" value="Team X" />
          <HeaderLabel label="Lifecycle" value="Alpha" />
          <SupportButton>A description of your plugin goes here.</SupportButton>
        </Header>
        <TabbedLayout>
          <TabbedLayout.Route path="/templates" title="Template List">
            <Content>
              <ContentHeader title="Template List" />
              <CatalogItems />
            </Content>
          </TabbedLayout.Route>
          <TabbedLayout.Route path="/another-tab" title="Another Tab">
            <Content>
              <ContentHeader title="Another Tab" />
              <InfoCard>Nothing to see here :(</InfoCard>
            </Content>
          </TabbedLayout.Route>
        </TabbedLayout>
      </Page>
    </Wrapper>
  );
};
