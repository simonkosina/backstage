/*
 * Copyright 2022 The Backstage Authors
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
import React, { useState } from 'react';
import { Content, Header, Page } from '@backstage/core-components';
import {
  TemplateDirectoryAccess,
  WebFileSystemAccess,
} from '../../lib/filesystem';
import { TemplateFormPreviewer } from './TemplateFormPreviewer';
import {
  FieldExtensionOptions,
  FormProps,
  type LayoutOptions,
} from '@backstage/plugin-scaffolder-react';
import { TemplateEditorIntro } from './TemplateEditorIntro';
import { ScaffolderPageContextMenu } from '@backstage/plugin-scaffolder-react/alpha';
import { useNavigate } from 'react-router-dom';
import { useRouteRef } from '@backstage/core-plugin-api';
import {
  actionsRouteRef,
  editorRouteRef,
  customFieldsRouteRef,
  rootRouteRef,
  scaffolderListTaskRouteRef,
} from '../../routes';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { scaffolderTranslationRef } from '../../translation';
import { WebFileSystemStore } from '../../lib/filesystem/WebFileSystemAccess';
import { createExampleTemplate } from '../../lib/filesystem/createExampleTemplate';

type Selection =
  | {
      type: 'local';
      directory: TemplateDirectoryAccess;
    }
  | {
      type: 'create-template';
    }
  | {
      type: 'form';
    }
  | {
      type: 'field-explorer';
    };

interface TemplateEditorPageProps {
  defaultPreviewTemplate?: string;
  customFieldExtensions?: FieldExtensionOptions<any, any>[];
  layouts?: LayoutOptions[];
  formProps?: FormProps;
}

export function TemplateEditorPage(props: TemplateEditorPageProps) {
  const [selection, setSelection] = useState<Selection>();
  const navigate = useNavigate();
  const actionsLink = useRouteRef(actionsRouteRef);
  const tasksLink = useRouteRef(scaffolderListTaskRouteRef);
  const createLink = useRouteRef(rootRouteRef);
  const editorLink = useRouteRef(editorRouteRef);
  const customFieldsLink = useRouteRef(customFieldsRouteRef);
  const { t } = useTranslationRef(scaffolderTranslationRef);

  const scaffolderPageContextMenuProps = {
    onEditorClicked: undefined,
    onActionsClicked: () => navigate(actionsLink()),
    onTasksClicked: () => navigate(tasksLink()),
    onCreateClicked: () => navigate(createLink()),
  };

  let content: JSX.Element | null = null;
  if (selection?.type === 'form') {
    content = (
      <TemplateFormPreviewer
        defaultPreviewTemplate={props.defaultPreviewTemplate}
        customFieldExtensions={props.customFieldExtensions}
        onClose={() => setSelection(undefined)}
        layouts={props.layouts}
        formProps={props.formProps}
      />
    );
  } else {
    content = (
      <Content>
        <TemplateEditorIntro
          onSelect={option => {
            if (option === 'local') {
              WebFileSystemAccess.requestDirectoryAccess()
                .then(directory => WebFileSystemStore.setDirectory(directory))
                .then(() => navigate(editorLink()))
                .catch(() => {});
            } else if (option === 'create-template') {
              WebFileSystemAccess.requestDirectoryAccess()
                .then(directory => {
                  createExampleTemplate(directory).then(() => {
                    WebFileSystemStore.setDirectory(directory);
                    navigate(editorLink());
                  });
                })
                .catch(() => {});
            } else if (option === 'form') {
              setSelection({ type: 'form' });
            } else if (option === 'field-explorer') {
              navigate(customFieldsLink());
            }
          }}
        />
      </Content>
    );
  }

  return (
    <Page themeId="home">
      <Header
        title={t('templateEditorPage.title')}
        subtitle={t('templateEditorPage.subtitle')}
      >
        <ScaffolderPageContextMenu {...scaffolderPageContextMenuProps} />
      </Header>
      {content}
    </Page>
  );
}
