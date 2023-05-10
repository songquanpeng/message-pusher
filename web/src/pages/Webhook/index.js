import React from 'react';
import { Header, Segment } from 'semantic-ui-react';
import WebhooksTable from '../../components/WebhooksTable';

const Webhook = () => (
  <>
    <Segment>
      <Header as='h3'>我的接口</Header>
      <WebhooksTable />
    </Segment>
  </>
);

export default Webhook;
