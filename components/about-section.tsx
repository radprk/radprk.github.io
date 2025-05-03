"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { GraduationCap, Award, Heart } from "lucide-react"

export default function AboutSection() {
  const educationData = [
    {
      institution: "Carnegie Mellon University",
      degree: "Master of Information Systems Management",
      period: "Aug 2024 - Aug 2025",
      location: "Pittsburgh, PA",
      courses: [
        "Intro to Deep Learning",
        "AI Venture Studio",
        "Intro to Machine Learning",
        "Operationalizing AI",
        "Agent Based Modelling and Agentic Technology",
        "OOP in Java",
        "Distributed Systems",
        "Agile Methods",
      ],
    },
    {
      institution: "Manipal Institute of Technology",
      degree: "B.Tech in Aeronautical Engineering, Minor: Data Science",
      period: "July 2017 - July 2021",
      location: "Udupi, KA, India",
    },
  ]

  const personalInterests = [
    "Tutoring mathematics to middle school children",
    "Astronomy and skywatching",
    "Podcasting and digital content creation",
    "Renewable energy research",
    "Sports and team activities",
  ]

  return (
    <section id="about" className="py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <Badge variant="outline" className="mb-4">
            About Me
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">My Journey</h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            From Aeronautical Engineering to AI innovation, my path has been driven by a passion for solving complex
            problems and creating technology that makes a difference.
          </p>
        </motion.div>

        <Tabs defaultValue="education" className="w-full max-w-4xl mx-auto">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="education" className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              <span className="hidden sm:inline">Education</span>
            </TabsTrigger>
            <TabsTrigger value="bio" className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              <span className="hidden sm:inline">Bio</span>
            </TabsTrigger>
            <TabsTrigger value="interests" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              <span className="hidden sm:inline">Interests</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="education">
            <div className="space-y-6">
              {educationData.map((edu, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div>
                          <h3 className="text-xl font-semibold">{edu.institution}</h3>
                          <p className="text-gray-600 dark:text-gray-300">{edu.degree}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{edu.location}</p>

                          {edu.courses && (
                            <div className="mt-4">
                              <h4 className="text-sm font-medium mb-2">Relevant Coursework:</h4>
                              <div className="flex flex-wrap gap-2">
                                {edu.courses.map((course, i) => (
                                  <Badge key={i} variant="secondary" className="font-normal">
                                    {course}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          <span className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm px-3 py-1 rounded-full">
                            {edu.period}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="bio">
            <Card>
              <CardContent className="p-6">
                <div className="prose dark:prose-invert max-w-none">
                  <p>
                    My journey began in Aeronautical Engineering, where I developed a strong foundation in
                    problem-solving and analytical thinking. During my undergraduate studies, I discovered my passion
                    for data science and AI, which led me to pursue a minor in Data Science alongside my engineering
                    degree.
                  </p>
                  <p className="mt-4">
                    After graduating, I joined Fractal Analytics as a Data Engineer, where I spent three years
                    implementing MLOps solutions, building ETL pipelines, and improving model accuracy for multinational
                    clients. This experience gave me valuable insights into the real-world applications of AI and
                    machine learning in business contexts.
                  </p>
                  <p className="mt-4">
                    Currently, I'm pursuing a Master's in Information Systems Management at Carnegie Mellon University,
                    where I'm deepening my expertise in deep learning, neural architecture search, and AI applications.
                    I'm also the founder of CuddleCode, an AI-powered coding tutor that adapts to users' programming
                    abilities.
                  </p>
                  <p className="mt-4">
                    My unique background in aeronautical engineering combined with my data science expertise gives me a
                    distinctive perspective on problem-solving and innovation in the AI space.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="interests">
            <Card>
              <CardContent className="p-6">
                <ul className="space-y-4">
                  {personalInterests.map((interest, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="flex items-start gap-3"
                    >
                      <div className="h-6 w-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white shrink-0">
                        {index + 1}
                      </div>
                      <p>{interest}</p>
                    </motion.li>
                  ))}
                </ul>
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                  <p className="text-sm italic">
                    "Beyond my professional pursuits, I'm passionate about education and mentoring. I believe in the
                    power of technology to make learning more accessible and engaging for everyone."
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  )
}
