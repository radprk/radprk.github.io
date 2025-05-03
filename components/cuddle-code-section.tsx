"use client"

import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ExternalLink, Code, Lightbulb, Target, Layers, ArrowRight } from "lucide-react"

export default function CuddleCodeSection() {
  const features = [
    {
      icon: <Lightbulb className="h-5 w-5" />,
      title: "Dynamic Assessment",
      description: "Real-time evaluation of coding skills and knowledge gaps",
    },
    {
      icon: <Target className="h-5 w-5" />,
      title: "Personalized Learning",
      description: "Adaptive curriculum that evolves with the user's progress",
    },
    {
      icon: <Layers className="h-5 w-5" />,
      title: "Multi-language Support",
      description: "Comprehensive coverage of popular programming languages",
    },
    {
      icon: <Code className="h-5 w-5" />,
      title: "Interactive Exercises",
      description: "Hands-on coding challenges with immediate feedback",
    },
  ]

  const technologies = [
    "Deep Learning",
    "Natural Language Processing",
    "Reinforcement Learning",
    "Python",
    "React",
    "Node.js",
    "TensorFlow",
    "PyTorch",
  ]

  return (
    <section id="cuddle-code" className="py-20 bg-gradient-to-b from-transparent to-blue-50 dark:to-blue-950/20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <Badge variant="outline" className="mb-4">
            Featured Venture
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">CuddleCode</h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Redefining New Age Tech Hiring 
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative">
              <div className="aspect-video rounded-lg overflow-hidden shadow-xl">
                <img
                  src="./placeholder.svg?height=400&width=600"
                  alt="CuddleCode Platform"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg">
                <Badge className="bg-gradient-to-r from-blue-600 to-purple-600">Founded 2025</Badge>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className="text-2xl font-bold mb-4">The Mission</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              CuddleCode is revolutionizing tech hiring by providing a comprehensive platform that assesses coding skills and knowledge gaps in real-time. Our mission is to empower both candidates and employers with data-driven insights, ensuring a perfect match for tech roles.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <div className="shrink-0 h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300">
                    {feature.icon}
                  </div>
                  <div>
                    <h4 className="font-medium">{feature.title}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {technologies.map((tech, index) => (
                <Badge key={index} variant="secondary">
                  {tech}
                </Badge>
              ))}
            </div>

            <Button
              asChild
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <a href="#" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                Learn More <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </motion.div>
        </div>

        <div className="mt-20">
          <Tabs defaultValue="roadmap" className="w-full max-w-4xl mx-auto">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="roadmap">Development Roadmap</TabsTrigger>
              <TabsTrigger value="approach">Technical Approach</TabsTrigger>
              <TabsTrigger value="partnerships">Partnerships</TabsTrigger>
            </TabsList>

            <TabsContent value="roadmap">
              <Card>
                <CardContent className="p-6">
                  <div className="relative">
                    <div className="absolute top-0 bottom-0 left-6 w-0.5 bg-blue-200 dark:bg-blue-800"></div>

                    {[
                      {
                        phase: "Phase 1: Research & Development",
                        timeline: "Jan 2025 - Apr 2025",
                        description: "Market research, user interviews, and prototype development",
                        status: "Completed",
                      },
                      {
                        phase: "Phase 2: MVP Launch",
                        timeline: "May 2025 - Aug 2025",
                        description: "Launch of minimum viable product with core assessment functionality",
                        status: "In Progress",
                      },
                      {
                        phase: "Phase 3: Pilot Programs",
                        timeline: "Sep 2025 - Dec 2025",
                        description: "Partnerships with educational institutions for initial testing",
                        status: "Upcoming",
                      },
                      {
                        phase: "Phase 4: Full Platform Launch",
                        timeline: "Jan 2026",
                        description: "Public release with comprehensive features and language support",
                        status: "Planned",
                      },
                    ].map((item, index) => (
                      <div key={index} className="relative pl-12 pb-10">
                        <div className="absolute left-5 -translate-x-1/2 h-6 w-6 rounded-full bg-blue-500 border-4 border-white dark:border-gray-900"></div>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div>
                            <h3 className="text-lg font-semibold">{item.phase}</h3>
                            <p className="text-gray-600 dark:text-gray-300 mt-1">{item.description}</p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <span className="text-sm text-gray-500 dark:text-gray-400">{item.timeline}</span>
                            <Badge
                              variant={
                                item.status === "Completed"
                                  ? "secondary"
                                  : item.status === "In Progress"
                                    ? "default"
                                    : "outline"
                              }
                            >
                              {item.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="approach">
              <Card>
                <CardContent className="p-6">
                  <div className="prose dark:prose-invert max-w-none">
                    <h3>Technical Architecture</h3>
                    <p>
                      CuddleCode is built on a sophisticated AI architecture that combines several machine learning
                      approaches:
                    </p>
                    <ul>
                      <li>
                        <strong>Knowledge Assessment Engine:</strong> A neural network trained to identify knowledge
                        gaps based on coding patterns and errors
                      </li>
                      <li>
                        <strong>Personalization Algorithm:</strong> Reinforcement learning system that optimizes
                        learning paths based on user performance
                      </li>
                      <li>
                        <strong>Code Analysis Framework:</strong> Static and dynamic code analysis tools integrated with
                        natural language processing
                      </li>
                      <li>
                        <strong>Feedback Generation:</strong> Large language models fine-tuned for educational contexts
                        to provide helpful, encouraging feedback
                      </li>
                    </ul>

                    <h3 className="mt-6">Development Methodology</h3>
                    <p>
                      Our development process follows an iterative approach with continuous user testing and feedback
                      integration:
                    </p>
                    <ol>
                      <li>Initial prototype development based on educational research and best practices</li>
                      <li>User testing with students of varying skill levels to gather performance data</li>
                      <li>Model refinement and feature enhancement based on collected data</li>
                      <li>Continuous deployment with A/B testing of new learning algorithms</li>
                    </ol>

                    <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                      <p className="text-sm">
                        "Our unique approach combines traditional educational methodologies with cutting-edge AI
                        techniques, creating a learning experience that's both effective and engaging."
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="partnerships">
              <Card>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-xl font-semibold mb-4">Current Partnerships</h3>
                      <ul className="space-y-4">
                        <li className="flex items-start gap-3">
                          <div className="h-10 w-10 rounded bg-gray-200 dark:bg-gray-700 flex items-center justify-center shrink-0">
                            <span className="font-semibold">CC</span>
                          </div>
                          <div>
                            <h4 className="font-medium">Community Colleges</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              Piloting with local community colleges to support computer science education
                            </p>
                          </div>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="h-10 w-10 rounded bg-gray-200 dark:bg-gray-700 flex items-center justify-center shrink-0">
                            <span className="font-semibold">HS</span>
                          </div>
                          <div>
                            <h4 className="font-medium">High Schools</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              Working with high school STEM programs to introduce coding concepts
                            </p>
                          </div>
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-4">Partnership Opportunities</h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-4">We're actively seeking partnerships with:</p>
                      <ul className="space-y-2">
                        <li className="flex items-center gap-2">
                          <ArrowRight className="h-4 w-4 text-blue-500" />
                          <span>Educational institutions</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <ArrowRight className="h-4 w-4 text-blue-500" />
                          <span>Corporate training programs</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <ArrowRight className="h-4 w-4 text-blue-500" />
                          <span>Online learning platforms</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <ArrowRight className="h-4 w-4 text-blue-500" />
                          <span>Educational technology companies</span>
                        </li>
                      </ul>

                      <Button variant="outline" className="mt-6">
                        Contact for Partnership
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </section>
  )
}
