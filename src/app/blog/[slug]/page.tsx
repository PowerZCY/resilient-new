import { appConfig } from '@/lib/appConfig';
import fs from 'fs/promises';
import matter from 'gray-matter';
import { notFound } from 'next/navigation';
import path from 'path';
import BlogPostClient from './BlogPostClient';

async function getBlogPost(slug: string) {
  const locale = appConfig.i18n.defaultLocale;
  try {
    const filePath = path.join(process.cwd(), 'public', 'md', locale, `${slug}.md`);
    const content = await fs.readFile(filePath, 'utf8');
    // 使用 gray-matter 解析 markdown 内容，分离 frontmatter 和正文
    const { content: markdown } = matter(content);
    return markdown;
  } catch (error) {
    console.error(`Failed to load blog content: ${locale}-${slug}`, error)
    return null;
  }
}

export default async function BlogPost({
  params: { slug }
}: {
  params: {
    slug: string
  }
}) {
  const decodedSlug = decodeURIComponent(slug);
  const content = await getBlogPost(decodedSlug);

  if (!content) {
    notFound();
  }

  return (
    <BlogPostClient slug={decodedSlug} content={content} />
  );
}