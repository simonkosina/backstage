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

import React, { useState } from 'react';

import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Tooltip from '@material-ui/core/Tooltip';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import Button from '@material-ui/core/Button';
import Drawer from '@material-ui/core/Drawer';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';
import ExtensionIcon from '@material-ui/icons/Extension';
import DescriptionIcon from '@material-ui/icons/Description';

import { Link } from '@backstage/core-components';
import { FieldExtensionOptions } from '@backstage/plugin-scaffolder-react';

import { ActionPageContent } from '../../components/ActionsPage/ActionsPage';
import { CustomFieldPlaygroud } from './CustomFieldPlaygroud';

const useStyles = makeStyles(
  theme => ({
    paper: {
      width: '40%',
      padding: theme.spacing(2),
      backgroundColor: theme.palette.background.default,
    },
    appbar: {
      zIndex: 1,
    },
    toolbar: {
      display: 'grid',
      justifyItems: 'flex-end',
      padding: theme.spacing(0, 1),
      backgroundColor: theme.palette.background.paper,
    },
  }),
  { name: 'ScaffolderTemplateEditorToolbar' },
);

export function TemplateEditorToolbar(props: {
  fieldExtensions?: FieldExtensionOptions<any, any>[];
}) {
  const { fieldExtensions } = props;
  const classes = useStyles();
  const [showFieldsDrawer, setShowFieldsDrawer] = useState(false);
  const [showActionsDrawer, setShowActionsDrawer] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);

  return (
    <AppBar className={classes.appbar} position="relative">
      <Toolbar className={classes.toolbar}>
        <ButtonGroup variant="outlined" color="primary">
          <Tooltip title="Custom Fields Explorer">
            <Button size="small" onClick={() => setShowFieldsDrawer(true)}>
              <ExtensionIcon />
            </Button>
          </Tooltip>
          <Tooltip title="Installed Actions Documentation">
            <Button size="small" onClick={() => setShowActionsDrawer(true)}>
              <DescriptionIcon />
            </Button>
          </Tooltip>
          <Button onClick={() => setShowPublishModal(true)}>Publish</Button>
        </ButtonGroup>
        <Drawer
          classes={{ paper: classes.paper }}
          anchor="right"
          open={showFieldsDrawer}
          onClose={() => setShowFieldsDrawer(false)}
        >
          <CustomFieldPlaygroud fieldExtensions={fieldExtensions} />
        </Drawer>
        <Drawer
          classes={{ paper: classes.paper }}
          anchor="right"
          open={showActionsDrawer}
          onClose={() => setShowActionsDrawer(false)}
        >
          <ActionPageContent />
        </Drawer>
        <Dialog
          onClose={() => setShowPublishModal(false)}
          open={showPublishModal}
          aria-labelledby="publish-dialog-title"
          aria-describedby="publish-dialog-description"
        >
          <DialogTitle id="publish-dialog-title">Publish changes</DialogTitle>
          <DialogContent dividers>
            <DialogContentText id="publish-dialog-slide-description">
              Follow the instructions below to create or update a template:
              <ol>
                <li>Save the template files in a local directory</li>
                <li>
                  Create a pull request to a new or existing git repository
                </li>
                <li>
                  If the template already exists, the changes will be reflected
                  in the software catalog once the pull request gets merged
                </li>
                <li>
                  But if you are creating a new template, follow this{' '}
                  <Link to="https://backstage.io/docs/features/software-templates/adding-templates/">
                    documentation
                  </Link>{' '}
                  to register the new template repository in software catalog
                </li>
              </ol>
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button color="primary" onClick={() => setShowPublishModal(false)}>
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Toolbar>
    </AppBar>
  );
}
