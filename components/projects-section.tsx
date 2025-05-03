"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Github, ExternalLink, ArrowUpRight } from "lucide-react"

type Project = {
  id: number
  title: string
  description: string
  timeline: string
  image: string
  category: string[]
  technologies: string[]
  metrics: string[]
  github?: string
  demo?: string
}

export default function ProjectsSection() {
  const projects: Project[] = [
    {
      id: 1,
      title: "Neural Architecture Search with RL",
      description:
        "Implementing a reinforcement learning-based Neural Architecture Search framework to automatically discover optimal neural network architectures for deepfake audio detection.",
      timeline: "Feb 2025 - Present",
      image: "./placeholder.svg?height=300&width=500",
      category: ["ML/AI", "Audio", "Neural Architecture Search"],
      technologies: ["Python", "PyTorch", "Reinforcement Learning"],
      metrics: ["Equal Error Rate (EER) of 2.8% with baseline models", "Modular code to generalize across datasets"],
      github: "#",
    },
    {
      id: 2,
      title: "Real-Time Air Quality Prediction",
      description:
        "Building a real-time air quality prediction system leveraging Apache Kafka for high-throughput data streaming.",
      timeline: "Feb 2025 - Present",
      image: "./placeholder.svg?height=300&width=500",
      category: ["Data Engineering", "Streaming"],
      technologies: ["Kafka", "Python", "Machine Learning"],
      metrics: ["High-throughput data streaming", "Real-time predictions"],
      github: "#",
      demo: "#",
    },
    {
      id: 3,
      title: "Face Verification Using CNNs",
      description:
        "Developed a ResNet-34-based model trained on a VGGFace2 subset to generate discriminative face embeddings.",
      timeline: "Feb 2025 - Mar 2025",
      image: "./placeholder.svg?height=300&width=500",
      category: ["ML/AI", "Computer Vision"],
      technologies: ["PyTorch", "CNNs", "Triplet Loss", "ArcFace"],
      metrics: ["Trained on 8631 identities", "Evaluated on 6000 image pairs with 5749 identities"],
      github: "#",
    },
    {
      id: 4,
      title: "Automatic Speech Recognition",
      description:
        "Developed an end-to-end Automatic Speech Recognition (ASR) system using Mel-Frequency Cepstral Coefficients.",
      timeline: "Jan 2025 - Present",
      image: "./placeholder.svg?height=300&width=500",
      category: ["ML/AI", "Speech Recognition"],
      technologies: ["Python", "PyTorch", "Transformers", "RNN/LSTM"],
      metrics: ["Improved decoding accuracy with beam search", "Optimized for phoneme recognition tasks"],
      github: "#",
      demo: "#",
    },
  ]

  const categories = [
    "All",
    "ML/AI",
    "Computer Vision",
    "Speech Recognition",
    "Neural Architecture Search",
    "Data Engineering",
    "Audio",
    "Streaming",
  ]
  const [activeCategory, setActiveCategory] = useState("All")

  const filteredProjects =
    activeCategory === "All" ? projects : projects.filter((project) => project.category.includes(activeCategory))

  return (
    <section id="projects" className="py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <Badge variant="outline" className="mb-4">
            Portfolio
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Projects</h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            A collection of my technical projects in machine learning, AI, and data engineering
          </p>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {categories.map((category) => (
            <Button
              key={category}
              variant={activeCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory(category)}
              className={activeCategory === category ? "bg-blue-600 hover:bg-blue-700" : ""}
            >
              {category}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredProjects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="h-full overflow-hidden group">
                <div className="relative overflow-hidden aspect-video">
                  <img
                    src={project.image || "./placeholder.svg"}
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-blue-600">{project.timeline}</Badge>
                  </div>
                </div>

                <CardContent className="p-6">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {project.category.map((cat, i) => (
                      <Badge key={i} variant="secondary" className="font-normal">
                        {cat}
                      </Badge>
                    ))}
                  </div>

                  <h3 className="text-xl font-bold mb-2 group-hover:text-blue-600 transition-colors">
                    {project.title}
                  </h3>

                  <p className="text-gray-600 dark:text-gray-300 mb-4">{project.description}</p>

                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Technologies</h4>
                      <div className="flex flex-wrap gap-2">
                        {project.technologies.map((tech, i) => (
                          <Badge key={i} variant="outline" className="font-normal">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-2">Key Metrics</h4>
                      <ul className="space-y-1">
                        {project.metrics.map((metric, i) => (
                          <li key={i} className="text-sm flex items-start gap-2">
                            <ArrowUpRight className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                            <span>{metric}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="px-6 pb-6 pt-0 flex gap-3">
                  {project.github && (
                    <Button asChild variant="outline" size="sm" className="gap-2">
                      <a href={project.github} target="_blank" rel="noopener noreferrer">
                        <Github className="h-4 w-4" />
                        GitHub
                      </a>
                    </Button>
                  )}

                  {project.demo && (
                    <Button asChild size="sm" className="gap-2 bg-blue-600 hover:bg-blue-700">
                      <a href={project.demo} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                        Live Demo
                      </a>
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
