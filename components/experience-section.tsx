"use client"

import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Briefcase, MapPin, ArrowUpRight } from "lucide-react"

type Experience = {
  id: number
  company: string
  position: string
  location: string
  period: string
  description: string[]
  technologies: string[]
  logo: string
}

export default function ExperienceSection() {
  const experiences: Experience[] = [
    {
      id: 1,
      company: "CuddleCode",
      position: "Founder",
      location: "Pittsburgh, PA",
      period: "Jan 2025 - Present",
      description: [
        "Conceptualized and developing an AI-powered coding tutor that dynamically assesses and adapts to user's programming abilities",
        "Leading end-to-end product development from market research and user interviews to prototype development",
        "Exploring partnership opportunities with nearby community colleges/highschools for initial pilot programs",
        "Developing unique assessment methodology that identifies specific coding knowledge gaps in real-time",
        "Designing data collection framework to continuously improve personalization algorithms",
      ],
      technologies: ["AI", "Machine Learning", "Product Development", "UX Research"],
      logo: "./placeholder.svg?height=80&width=80",
    },
    {
      id: 2,
      company: "Fractal Analytics",
      position: "Data Engineer",
      location: "Bangalore, India",
      period: "Aug 2021 - June 2024",
      description: [
        "Implemented MLOps on Azure for a transportation analytics project, maintaining 74% model accuracy in a CPG corporation's track and trace application",
        "Designed low latency and high throughput ADF pipelines for automating data ingestion into the PowerBI dashboards for multinational retail corporation processing upto ~100 GB data in less than 15 minutes",
        "Built ETL pipelines to ingest data from disparate sources for a webapp with 500 daily active users and optimized throughput for existing cosmosDB containers, reducing cost by ~$1000/month",
        "Improved the accuracy of an existing model predicting cashflows by 70% for top 52 vendors and customers by augmenting existing data with more fields from the SAP-ERP system using ARIMA and SARIMAX",
        "Reduced model deployment failures by 15% by constructing unit tests using TensorFlow to validate statistical integrity of the MMM simulation model within the CI/CD pipeline",
      ],
      technologies: ["Azure", "MLOps", "ETL", "PowerBI", "TensorFlow", "Time Series Analysis"],
      logo: "./placeholder.svg?height=80&width=80",
    },
    {
      id: 3,
      company: "Homework App",
      position: "Product Management Intern",
      location: "Bangalore, India",
      period: "Mar 2021 - June 2021",
      description: [
        "Leveraged Mixpanel for executing 50+ user interviews for user research and product usability analysis",
        "Designed 3 features to enhance UX for recurring users by reducing friction in user flow; resulted in 50% increase in downloads",
        "Conducted E2E product testing for the weekly releases and collaborated with dev team on bug fixes",
      ],
      technologies: ["Product Management", "User Research", "UX Design", "Mixpanel"],
      logo: "./placeholder.svg?height=80&width=80",
    },
  ]

  return (
    <section id="experience" className="py-20 bg-gradient-to-b from-transparent to-blue-50 dark:to-blue-950/20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <Badge variant="outline" className="mb-4">
            Experience
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Professional Journey</h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            My career path from data engineering to AI innovation
          </p>
        </motion.div>

        <div className="relative max-w-4xl mx-auto">
          {/* Timeline line */}
          <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-0.5 bg-blue-200 dark:bg-blue-800 transform md:translate-x-px"></div>

          {experiences.map((exp, index) => (
            <motion.div
              key={exp.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative mb-12 md:mb-24 ${
                index % 2 === 0 ? "md:pr-12 md:text-right md:ml-auto md:mr-1/2" : "md:pl-12 md:ml-1/2"
              }`}
            >
              {/* Timeline dot */}
              <div className="absolute left-0 md:left-1/2 top-6 w-5 h-5 rounded-full bg-blue-500 border-4 border-white dark:border-gray-900 transform -translate-x-1/2"></div>

              <Card className={`relative ${index % 2 === 0 ? "md:mr-6" : "md:ml-6"}`}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-6 items-start">
                    <div className={`shrink-0 ${index % 2 === 0 ? "md:order-last" : ""}`}>
                      <div className="w-16 h-16 rounded-lg bg-white dark:bg-gray-800 shadow-md flex items-center justify-center p-2">
                        <img
                          src={exp.logo || "./placeholder.svg"}
                          alt={exp.company}
                          className="max-w-full max-h-full"
                        />
                      </div>
                    </div>

                    <div className="flex-1">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-3">
                        <h3 className="text-xl font-bold">{exp.position}</h3>
                        <Badge className="bg-blue-600 md:ml-auto">{exp.period}</Badge>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-gray-500 dark:text-gray-400 mb-4">
                        <div className="flex items-center gap-1">
                          <Briefcase className="h-4 w-4" />
                          <span>{exp.company}</span>
                        </div>
                        <div className="hidden sm:block">•</div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>{exp.location}</span>
                        </div>
                      </div>

                      <ul className="space-y-2 mb-4">
                        {exp.description.map((item, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <ArrowUpRight className="h-4 w-4 text-blue-500 shrink-0 mt-1" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>

                      <div className="flex flex-wrap gap-2 mt-4">
                        {exp.technologies.map((tech, i) => (
                          <Badge key={i} variant="secondary" className="font-normal">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
