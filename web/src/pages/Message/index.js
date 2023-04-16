import React from 'react';
import { Header, Segment } from 'semantic-ui-react';
import MessagesTable from '../../components/MessagesTable';

const Message = () => (
  <>
    <Segment>
      <Header as='h3'>我的消息</Header>
      <MessagesTable />
    </Segment>
  </>
);

export default Message;
