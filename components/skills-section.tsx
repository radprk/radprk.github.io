"use client"

import type React from "react"

import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Code, Database, Server, PenToolIcon as Tool } from "lucide-react"

type Skill = {
  name: string
  level: "Advanced" | "Intermediate" | "Basic"
}

type SkillCategory = {
  id: string
  name: string
  icon: React.ReactNode
  skills: Skill[]
}

export default function SkillsSection() {
  const skillCategories: SkillCategory[] = [
    {
      id: "programming",
      name: "Programming Languages & Frameworks",
      icon: <Code className="h-5 w-5" />,
      skills: [
        { name: "Python", level: "Advanced" },
        { name: "PyTorch", level: "Advanced" },
        { name: "NumPy", level: "Advanced" },
        { name: "Pandas", level: "Advanced" },
        { name: "Java", level: "Intermediate" },
        { name: "SQL", level: "Intermediate" },
        { name: "TensorFlow", level: "Intermediate" },
        { name: "Kafka", level: "Intermediate" },
        { name: "Git", level: "Intermediate" },
        { name: "Bash", level: "Basic" },
        { name: "JavaScript", level: "Basic" },
        { name: "Flask", level: "Basic" },
        { name: "WandB", level: "Basic" },
      ],
    },
    {
      id: "ml-ai",
      name: "Machine Learning & AI",
      icon: <Database className="h-5 w-5" />,
      skills: [
        { name: "Deep Learning", level: "Advanced" },
        { name: "Neural Architecture Search", level: "Advanced" },
        { name: "CNNs", level: "Advanced" },
        { name: "ASR", level: "Intermediate" },
        { name: "Transformers", level: "Intermediate" },
        { name: "RNNs/LSTMs", level: "Intermediate" },
        { name: "PPO", level: "Intermediate" },
        { name: "MLOps", level: "Intermediate" },
        { name: "HuggingFace", level: "Intermediate" },
        { name: "LangChain", level: "Basic" },
        { name: "OpenAI", level: "Basic" },
      ],
    },
    {
      id: "data-cloud",
      name: "Data & Cloud Systems",
      icon: <Server className="h-5 w-5" />,
      skills: [
        { name: "ETL/ELT pipelines", level: "Advanced" },
        { name: "Azure (ADF, Cosmos DB)", level: "Advanced" },
        { name: "AWS", level: "Intermediate" },
        { name: "CI/CD", level: "Intermediate" },
        { name: "User Research", level: "Intermediate" },
        { name: "Experimental Design", level: "Intermediate" },
      ],
    },
    {
      id: "tools",
      name: "Tools & Methodologies",
      icon: <Tool className="h-5 w-5" />,
      skills: [
        { name: "Data Analysis", level: "Advanced" },
        { name: "Statistical Modeling", level: "Advanced" },
        { name: "Agile Development", level: "Intermediate" },
        { name: "Product Management", level: "Intermediate" },
        { name: "UX Research", level: "Intermediate" },
        { name: "Technical Writing", level: "Intermediate" },
      ],
    },
  ]

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Advanced":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "Intermediate":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "Basic":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  const getProgressWidth = (level: string) => {
    switch (level) {
      case "Advanced":
        return "w-full"
      case "Intermediate":
        return "w-2/3"
      case "Basic":
        return "w-1/3"
      default:
        return "w-0"
    }
  }

  return (
    <section id="skills" className="py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <Badge variant="outline" className="mb-4">
            Expertise
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Skills & Technologies</h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            A comprehensive overview of my technical skills and proficiencies
          </p>
        </motion.div>

        <Tabs defaultValue="programming" className="w-full max-w-4xl mx-auto">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-8">
            {skillCategories.map((category) => (
              <TabsTrigger key={category.id} value={category.id} className="flex items-center gap-2">
                {category.icon}
                <span className="hidden sm:inline">{category.name.split(" ")[0]}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {skillCategories.map((category) => (
            <TabsContent key={category.id} value={category.id}>
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    {category.icon}
                    <span>{category.name}</span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {category.skills.map((skill, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                      >
                        <div className="mb-1 flex justify-between items-center">
                          <span className="font-medium">{skill.name}</span>
                          <span className={`text-xs px-2 py-1 rounded-full ${getLevelColor(skill.level)}`}>
                            {skill.level}
                          </span>
                        </div>
                        <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full ${getProgressWidth(skill.level)}`}
                          ></div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  )
}
