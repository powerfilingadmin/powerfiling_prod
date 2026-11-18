import rawBlogs from './blogs.json';

// content is stored as an array of paragraphs for easy editing.
// Join them back into the string format the renderer expects.
const blogs = rawBlogs.map((blog) => ({
  ...blog,
  content: Array.isArray(blog.content) ? blog.content.join('\n\n') : blog.content,
}));

export default blogs;
