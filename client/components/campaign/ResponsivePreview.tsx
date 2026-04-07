'use client';

import React, { useState } from 'react';
import styles from './ResponsivePreview.module.css';

interface ResponsivePreviewProps {
  blogContent?: string;
  socialThread?: string[];
  emailContent?: string;
  isGenerating?: boolean;
}

const DEFAULT_BLOG = `In today's fast-paced digital world, maintaining an active, consistent, and engaging content strategy is no longer a luxury—it's a necessity. Companies are expected to be everywhere at once: publishing deep-dive blog posts, maintaining snappy social media threads, and sending out high-converting email newsletters.

But let's be honest. Doing this manually is exhausting.

Enter the F.A.C.T.S. By leveraging an orchestration of specialized AI agents, we can transform a single source document into a coordinated, multi-channel marketing campaign. The Value Proposition isn't just about saving time; it's about amplifying your team's creative potential without burning them out.

Our platform utilizes a Fact-Check agent to guarantee accuracy, a Copywriter to synthesize the tone, and an Editor-in-Chief to eliminate hallucinations. The result? Uncompromised quality at machine speed.`;

const DEFAULT_SOCIAL = [
  "Struggling to keep up with your content calendar? You're not alone. The demand for multi-channel marketing is breaking creative teams. 🧵 1/5",
  "Most AI tools just spit out raw text. It lacks tone, structure, and fact-checking. You still spend hours editing. That's a band-aid, not a solution. 2/5",
  "Enter the F.A.C.T.S! A multi-agent orchestrated system that builds your campaign for you. Fact-Check -> Copywrite -> Editor QA. 3/5",
  "Our Value Proposition? Amplifying your team's creative bandwidth without the burnout. Turn a single PDF into Blogs, Threads, and Emails in seconds. 4/5",
  "Stop acting like a robot so you can start acting like a creator again. Let the autonomous pipeline handle the heavy lifting. 🚀 5/5"
];

const DEFAULT_EMAIL = `Subject: Stop drowning in your content calendar.

Hi team,

We know how exhausting it is to maintain a blog, a Twitter thread, and a newsletter every single week manually. That's why we're so excited to introduce our new F.A.C.T.S.

By utilizing multi-agent AI orchestration, our platform transforms a single source document into a comprehensive, verified, and beautifully formatted marketing campaign across all your platforms. Fact-checked by default, edited for tone, and ready to publish.

Click below to see the magic in action.

Best,
The Marketing Team`;

const DesktopIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
    <line x1="8" y1="21" x2="16" y2="21"></line>
    <line x1="12" y1="17" x2="12" y2="21"></line>
  </svg>
);

const MobileIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
    <line x1="12" y1="18" x2="12.01" y2="18"></line>
  </svg>
);

const HeartIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
);
const RepostIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 1 21 5 17 9"></polyline><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><polyline points="7 23 3 19 7 15"></polyline><path d="M21 13v2a4 4 0 0 1-4 4H3"></path></svg>
);
const ReplyIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
);

export default function ResponsivePreview({
  blogContent,
  socialThread,
  emailContent,
  isGenerating = false,
}: ResponsivePreviewProps) {
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [activeTab, setActiveTab] = useState<'blog' | 'social' | 'email'>('blog');

  const content = {
    blog: blogContent || DEFAULT_BLOG,
    social: socialThread && socialThread.length > 0 ? socialThread : DEFAULT_SOCIAL,
    email: emailContent || DEFAULT_EMAIL,
  };

  const renderBlog = () => (
    <div className={`${styles.blogContainer} ${styles.fadeIn}`}>
      <h1>Content Marketing in the AI Era</h1>
      <div className={styles.blogAuthor}>
        <div className={styles.blogAuthorAvatar}></div>
        <span>By AC Factory • 5 min read</span>
      </div>
      <div className={styles.blogBody}>
        {content.blog.split('\n\n').map((para, i) => (
          <p key={i} style={{ marginBottom: '1rem' }}>{para}</p>
        ))}
      </div>
    </div>
  );

  const renderSocial = () => (
    <div className={`${styles.socialContainer} ${styles.fadeIn}`}>
      {content.social.map((post, i) => (
        <div key={i} className={styles.socialPost}>
          <div className={styles.socialAvatar}></div>
          <div className={styles.socialContent}>
            <div className={styles.socialHeader}>
              <span className={styles.socialName}>Marketing AI</span>
              <span className={styles.socialHandle}>@ContentFactory • 2h</span>
            </div>
            <div className={styles.socialText}>{post}</div>
            <div className={styles.socialActions}>
              <span style={{ display: 'flex', alignItems:'center', gap:'4px'}}><ReplyIcon /> {Math.floor(Math.random() * 10) + 1}</span>
              <span style={{ display: 'flex', alignItems:'center', gap:'4px'}}><RepostIcon /> {Math.floor(Math.random() * 20) + 2}</span>
              <span style={{ display: 'flex', alignItems:'center', gap:'4px'}}><HeartIcon /> {Math.floor(Math.random() * 100) + 10}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderEmail = () => {
    // Basic parser for Subject line
    const lines = content.email.split('\n');
    const subject = lines.find(l => l.startsWith('Subject:'))?.replace('Subject:', '').trim() || 'Your Marketing Update';
    const bodyText = content.email.replace(/^Subject:.*$/m, '').trim();

    return (
      <div className={`${styles.emailContainer} ${styles.fadeIn}`}>
        <div className={styles.emailHeader}>
          <div className={styles.emailRow}>
            <span className={styles.emailLabel}>From:</span>
            <span className={styles.emailValue}>AC Factory &lt;hello@contentfactory.ai&gt;</span>
          </div>
          <div className={styles.emailRow}>
            <span className={styles.emailLabel}>To:</span>
            <span className={styles.emailValue}>Marketing Subscriptions</span>
          </div>
          <div className={styles.emailSubject}>{subject}</div>
        </div>
        <div className={styles.emailBody}>
          {bodyText.split('\n').map((para, i) => (
            <p key={i} style={{ marginBottom: '1rem' }}>{para || '\u00A0'}</p>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      {/* Top Header Controls */}
      <div className={styles.header}>
        <div className={styles.tabs}>
          <button 
            className={`${styles.tabBtn} ${activeTab === 'blog' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('blog')}
          >
            Blog Post
          </button>
          <button 
            className={`${styles.tabBtn} ${activeTab === 'social' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('social')}
          >
            Social Thread
          </button>
          <button 
            className={`${styles.tabBtn} ${activeTab === 'email' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('email')}
          >
            Email Teaser
          </button>
        </div>

        <div className={styles.controls}>
          <button 
            className={`${styles.deviceBtn} ${device === 'desktop' ? styles.deviceBtnActive : ''}`}
            onClick={() => setDevice('desktop')}
          >
            <DesktopIcon /> Desktop
          </button>
          <button 
            className={`${styles.deviceBtn} ${device === 'mobile' ? styles.deviceBtnActive : ''}`}
            onClick={() => setDevice('mobile')}
          >
            <MobileIcon /> Mobile
          </button>
        </div>
      </div>

      {/* Preview Area */}
      <div className={styles.previewArea}>
        <div className={device === 'desktop' ? styles.desktopView : styles.mobileView}>
          {device === 'mobile' && <div className={styles.mobileNotch}></div>}
          
          <div style={{ opacity: isGenerating ? 0.5 : 1, transition: 'opacity 0.3s' }}>
            {activeTab === 'blog' && renderBlog()}
            {activeTab === 'social' && renderSocial()}
            {activeTab === 'email' && renderEmail()}
          </div>
        </div>
      </div>
    </div>
  );
}
