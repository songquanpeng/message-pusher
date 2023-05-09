import { API } from './api';
import { showError } from './utils';

export const loadUser = async () => {
  let res = await API.get(`/api/user/self`);
  const { success, message, data } = res.data;
  if (success) {
    if (data.channel === '') {
      data.channel = 'email';
    }
    if (data.token === ' ') {
      data.token = '';
    }
    return data;
  } else {
    showError(message);
    return null;
  }
};

export const loadUserChannels = async () => {
  let res = await API.get(`/api/channel?brief=true`);
  const { success, message, data } = res.data;
  if (success) {
    data.forEach((channel) => {
      channel.key = channel.name;
      channel.text = channel.name;
      channel.value = channel.name;
      if (channel.description === '') {
        channel.description = '无备注信息';
      }
    });
    return data;
  } else {
    showError(message);
    return null;
  }
};