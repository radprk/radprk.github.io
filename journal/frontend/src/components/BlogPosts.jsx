import { useState } from 'react'

function BlogModal({ post, onClose }) {
  if (!post) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content blog-modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>&times;</button>

        <article className="blog-article">
          <header>
            <h1>{post.title}</h1>
            {post.date && (
              <time className="blog-date">{post.date}</time>
            )}
            {post.tags && (
              <div className="blog-tags">
                {post.tags.map((tag, idx) => (
                  <span key={idx} className="blog-tag">{tag}</span>
                ))}
              </div>
            )}
          </header>

          <div className="blog-body">
            {/* Simple markdown-like rendering */}
            {post.body?.split('\n\n').map((paragraph, idx) => {
              // Headers
              if (paragraph.startsWith('## ')) {
                return <h2 key={idx}>{paragraph.slice(3)}</h2>
              }
              if (paragraph.startsWith('### ')) {
                return <h3 key={idx}>{paragraph.slice(4)}</h3>
              }
              // Code blocks
              if (paragraph.startsWith('```')) {
                const code = paragraph.replace(/```\w*\n?/g, '')
                return <pre key={idx}><code>{code}</code></pre>
              }
              // Regular paragraphs
              return <p key={idx}>{paragraph}</p>
            })}
          </div>
        </article>
      </div>
    </div>
  )
}

function BlogPosts({ posts }) {
  const [selectedPost, setSelectedPost] = useState(null)

  if (!posts || posts.length === 0) {
    return null
  }

  // Only show recent posts
  const recentPosts = posts.slice(0, 5)

  return (
    <section className="blog-posts card">
      <h2>Blog</h2>

      <div className="posts-list">
        {recentPosts.map((post, idx) => (
          <button
            key={idx}
            className="post-item"
            onClick={() => setSelectedPost(post)}
          >
            <span className="post-title">{post.title}</span>
            {post.date && (
              <span className="post-date">{post.date}</span>
            )}
          </button>
        ))}
      </div>

      <BlogModal
        post={selectedPost}
        onClose={() => setSelectedPost(null)}
      />
    </section>
  )
}

export default BlogPosts
