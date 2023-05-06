import { Label } from 'semantic-ui-react';
import { timestamp2string } from './utils';
import React from 'react';
import { CHANNEL_OPTIONS } from '../constants';

let channelMap = undefined;

export function renderChannel(key) {
  if (channelMap === undefined) {
    channelMap = new Map();
    CHANNEL_OPTIONS.forEach((option) => {
      channelMap[option.key] = option;
    });
  }
  let channel = channelMap[key];
  if (channel) {
    return (
      <Label basic style={{ backgroundColor: channel.color, color: 'white' }}>
        {channel.text}
      </Label>
    );
  }
  return (
    <Label basic color='red'>
      未知通道
    </Label>
  );
}

export function renderTimestamp(timestamp) {
  return <>{timestamp2string(timestamp)}</>;
}
