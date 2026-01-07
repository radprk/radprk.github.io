import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import './BlogPost.css'

function BlogPost() {
  const { id } = useParams()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadPost = async () => {
      try {
        const basePath = import.meta.env.BASE_URL
        const response = await fetch(`${basePath}data/blog.json`)
        if (!response.ok) throw new Error('Failed to load blog posts')
        
        const data = await response.json()
        const foundPost = data.posts?.find(p => p.id === id)
        
        if (!foundPost) {
          setError('Post not found')
        } else {
          setPost(foundPost)
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    
    if (id) {
      loadPost()
    }
  }, [id])

  if (loading) {
    return (
      <div className="blog-post-loading">
        <div className="loading-spinner"></div>
        <p>Loading post...</p>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="blog-post-error">
        <p>{error || 'Post not found'}</p>
        <Link to="/blog" className="back-link">← Back to blog</Link>
      </div>
    )
  }

  return (
    <article className="blog-post">
      <Link to="/blog" className="back-to-blog">← Back to blog</Link>
      
      <header className="post-header">
        <div className="post-meta-header">
          <span className="post-date-large">
            {new Date(post.date).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </span>
          {post.tags && (
            <div className="post-tags-large">
              {post.tags.map(tag => (
                <span key={tag} className="post-tag-large">{tag}</span>
              ))}
            </div>
          )}
        </div>
        <h1 className="post-title-large">{post.title}</h1>
        {post.subtitle && (
          <p className="post-subtitle">{post.subtitle}</p>
        )}
      </header>

      <div className="post-content">
        {post.content ? (
          <div 
            className="post-body"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        ) : (
          <div className="post-body">
            {post.excerpt && <p>{post.excerpt}</p>}
            <p>Full content coming soon...</p>
          </div>
        )}
      </div>

      <footer className="post-footer-large">
        <Link to="/blog" className="back-link-footer">← Back to blog</Link>
      </footer>
    </article>
  )
}

export default BlogPost

