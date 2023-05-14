import React, { useEffect, useState } from 'react';
import { Header, Segment } from 'semantic-ui-react';
import { API, showError } from '../../helpers';
import { marked } from 'marked';

const About = () => {
  const [about, setAbout] = useState('');
  const [aboutLoaded, setAboutLoaded] = useState(false);

  const displayAbout = async () => {
    setAbout(localStorage.getItem('about') || '');
    const res = await API.get('/api/about');
    const { success, message, data } = res.data;
    if (success) {
      let HTMLAbout = marked.parse(data);
      setAbout(HTMLAbout);
      localStorage.setItem('about', HTMLAbout);
    } else {
      showError(message);
      setAbout('加载关于内容失败...');
    }
    setAboutLoaded(true);
  };

  useEffect(() => {
    displayAbout().then();
  }, []);

  return (
    <>
      <Segment>
        {aboutLoaded && about === '' ? (
          <>
            <Header as='h3'>关于</Header>
            <p>可在设置页面设置关于内容，支持 HTML & Markdown</p>
            项目仓库地址：
            <a href='https://github.com/songquanpeng/message-pusher'>
              https://github.com/songquanpeng/message-pusher
            </a>
          </>
        ) : (
          <>
            <div dangerouslySetInnerHTML={{ __html: about }}></div>
          </>
        )}
      </Segment>
    </>
  );
};


export default About;
