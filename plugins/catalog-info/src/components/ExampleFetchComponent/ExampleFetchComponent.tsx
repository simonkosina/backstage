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
  Table,
  TableColumn,
  Progress,
  ResponseErrorPanel,
} from '@backstage/core-components';
import useAsync from 'react-use/lib/useAsync';
// FIXME: Sharing types between backend and frontend plugins? Project structure?
import { Template, TemplateListSchema } from '../../types';
import { configApiRef, useApi } from '@backstage/core-plugin-api';

type DenseTableProps = {
  templates: Template[];
};

export const DenseTable = ({ templates }: DenseTableProps) => {
  const columns: TableColumn[] = [
    { title: 'Name', field: 'name' },
    { title: 'Description', field: 'description' },
  ];

  const data = templates.map(template => {
    return {
      name: template.metadata.annotations['openshift.io/display-name'],
      description: template.metadata.annotations.description,
    };
  });

  return (
    <Table
      title="Example Template List"
      options={{ search: false, paging: false }}
      columns={columns}
      data={data}
    />
  );
};

export const ExampleFetchComponent = () => {
  const config = useApi(configApiRef);

  const { value, loading, error } =
    useAsync(async (): Promise<TemplateListSchema> => {
      const response = await fetch(
        `${config.getString('backend.baseUrl')}/api/catalog-info/templates`,
      );
      return response.json();
    }, []);

  if (loading) {
    return <Progress />;
  } else if (error) {
    return <ResponseErrorPanel error={error} />;
  }

  return <DenseTable templates={value.items || []} />;
};
