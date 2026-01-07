import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import './BlogList.css'

function BlogList() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load blog posts from JSON file
    const loadPosts = async () => {
      try {
        const basePath = import.meta.env.BASE_URL
        const response = await fetch(`${basePath}data/blog.json`)
        if (response.ok) {
          const data = await response.json()
          setPosts(data.posts || [])
        }
      } catch (err) {
        console.error('Failed to load blog posts:', err)
      } finally {
        setLoading(false)
      }
    }
    loadPosts()
  }, [])

  if (loading) {
    return <div className="blog-loading">Loading blog posts...</div>
  }

  return (
    <div className="blog-list">
      <div className="blog-header">
        <div className="blog-nav">
          <Link to="" className="back-to-journal">← Back to Journal</Link>
        </div>
        <h1>Blog</h1>
        <p className="blog-subtitle">Thoughts, learnings, and what I'm working on</p>
      </div>

      {posts.length === 0 ? (
        <div className="no-posts">
          <p>No blog posts yet. Check back soon!</p>
        </div>
      ) : (
        <div className="posts-grid">
          {posts.map(post => (
            <Link key={post.id} to={`/blog/${post.id}`} className="post-card">
              <div className="post-meta">
                <span className="post-date">
                  {new Date(post.date).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </span>
                {post.tags && (
                  <div className="post-tags">
                    {post.tags.map(tag => (
                      <span key={tag} className="post-tag">{tag}</span>
                    ))}
                  </div>
                )}
              </div>
              <h2 className="post-title">{post.title}</h2>
              {post.excerpt && (
                <p className="post-excerpt">{post.excerpt}</p>
              )}
              <div className="post-footer">
                <span className="read-more">Read more →</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default BlogList

