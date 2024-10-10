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
  Content,
  ContentHeader,
  Progress,
  ResponseErrorPanel,
} from '@backstage/core-components';
import { itemOrderSubRouteRef, templatesSubRouteRef } from '../../routes';
import {
  configApiRef,
  useApi,
  useRouteRef,
  useRouteRefParams,
} from '@backstage/core-plugin-api';
import {
  ArrayElement,
  Template,
  PartialSecret,
  PartialTemplateInstance,
  Secret,
} from '../../types';
import useAsync from 'react-use/esm/useAsync';
import { Button, TextField, Theme, makeStyles } from '@material-ui/core';
import Stack from '@mui/material/Stack';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';

const useItemOrderStyles = makeStyles((theme: Theme) => ({
  textField: {
    transition: 'width 0.3s ease-in-out',
    width: theme.spacing(125),
    maxWidth: theme.spacing(125),

    [theme.breakpoints.down('md')]: {
      width: '100%',
      maxWidth: theme.spacing(125),
    },
  },
}));

function generateDefaultValues(parameters: Template['parameters']) {
  return parameters.reduce(
    (
      data: Record<string, boolean | string>,
      parameter: ArrayElement<Template['parameters']>,
    ) => {
      return {
        ...data,
        [parameter.name.toString()]: parameter.value,
      };
    },
    {},
  );
}

type ItemFormProps = {
  template: Template;
};

// TODO: Form validation
export const ItemForm = ({ template }: ItemFormProps) => {
  const navigate = useNavigate();
  const templatesRoute = useRouteRef(templatesSubRouteRef)();
  const config = useApi(configApiRef);
  const classes = useItemOrderStyles();
  const { register, handleSubmit } = useForm({
    defaultValues: generateDefaultValues(template.parameters),
  });

  // TODO: Error handling
  const onSubmit = async (data: Record<string, string | boolean>) => {
    const namespace = 'default'; // TODO: Switch to a different project than default
    const templateData: Template = JSON.parse(JSON.stringify(template));
    templateData.parameters.forEach(parameter => {
      parameter.value = data[parameter.name.toString()];
    });

    const secretData: PartialSecret = {
      apiVersion: 'v1',
      kind: 'Secret',
      metadata: {
        generateName: `${template.metadata.name}-parameters-`,
        namespace: namespace,
      },
      stringData: data,
    };

    const response = await fetch(
      `${config.getString(
        'backend.baseUrl',
      )}/api/catalog-info/secrets/${namespace}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(secretData),
      },
    );

    const secret: Secret = await response.json();

    const templateInstance: PartialTemplateInstance = {
      apiVersion: 'template.openshift.io/v1',
      kind: 'TemplateInstance',
      metadata: {
        generateName: `${template.metadata.name}-`,
        namespace: namespace,
      },
      spec: {
        secret: {
          name: secret.metadata.name,
        },
        template: template,
      },
    };

    fetch(
      `${config.getString(
        'backend.baseUrl',
      )}/api/catalog-info/templateInstances/${namespace}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // This tells the server that the request body is JSON
        },
        body: JSON.stringify(templateInstance),
      },
    );

    // TODO: Redirect to /clusters
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={2}>
        {template.parameters.map(parameter => {
          return (
            <TextField
              classes={{ root: classes.textField }}
              size="small"
              variant="outlined"
              label={
                parameter.displayName
                  ? parameter.displayName.toString()
                  : parameter.name.toString()
              }
              InputLabelProps={{
                shrink: true,
              }}
              {...register(parameter.name.toString())}
            />
          );
        })}
        <Stack spacing={2} direction="row">
          <Button type="submit" variant="contained">
            Order
          </Button>
          <Button
            variant="outlined"
            onClick={() => {
              if (window.history.state?.idx !== 0) {
                navigate(-1);
              } else {
                navigate(templatesRoute);
              }
            }}
          >
            Cancel
          </Button>
        </Stack>
      </Stack>
    </form>
  );
};

// TODO: Explore caching options when user is redirected from the template list to the order page.
// All the data should be already available in such case.
export const ItemOrder = () => {
  const config = useApi(configApiRef);
  const { namespace, name } = useRouteRefParams(itemOrderSubRouteRef);

  const { value, loading, error } = useAsync(async (): Promise<Template> => {
    const response = await fetch(
      `${config.getString(
        'backend.baseUrl',
      )}/api/catalog-info/templates/${namespace}/${name}`,
    );
    return response.json();
  }, []);

  if (loading) {
    return <Progress />;
  } else if (error) {
    return <ResponseErrorPanel error={error} />;
  }

  return (
    <Content>
      <ContentHeader
        title={`Order ${value?.metadata.annotations['openshift.io/display-name']}`}
      />
      <ItemForm template={value!} />
    </Content>
  );
};
