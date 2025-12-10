



// import { useState } from 'react';

// const experiences = [
//   {
//     "period": "January 2025 – Present",
//     "role": "Information Technology Consultant",
//     "company": "Perfecta Consulting Pte Ltd",
//     "location": "Singapore · Remote",
//     "duration": "11 months",
//     "description": "Leading strategic IT consulting initiatives focused on enterprise digital transformation, system integration, and process optimization for diverse client portfolios across Southeast Asia.",
//     "achievements": [
//       "Successfully implemented Microsoft Dynamics 365 solutions for 5+ enterprise clients, resulting in 40% average improvement in operational efficiency",
//       "Designed and executed ERP integration strategies that streamlined cross-departmental workflows, reducing processing time by 35%",
//       "Led cross-functional teams of 8+ professionals in system optimization projects, delivering solutions 20% under budget",
//       "Developed customized training programs that increased client team adoption rates by 65%"
//     ],
//     "skills": [
//       "Microsoft Dynamics 365",
//       "Enterprise Resource Planning (ERP)",
//       "Digital Transformation Strategy",
//       "System Integration",
//       "Business Process Optimization",
//       "Project Management",
//       "Stakeholder Communication",
//       "Change Management"
//     ],
//     "responsibilities": [
//       "Conducted comprehensive needs assessments and gap analyses for client IT systems",
//       "Designed and presented tailored technology solutions to C-level executives",
//       "Managed full project lifecycle from planning to implementation and post-launch support",
//       "Facilitated workshops and training sessions for client teams",
//       "Developed detailed project documentation including requirements, specifications, and progress reports"
//     ],
//     "technologies": [
//       "Microsoft Dynamics 365",
//       "Power Platform",
//       "Azure Services",
//       "SQL Server",
//       "Power BI",
//       "SharePoint",
//       "Teams Integration"
//     ]
//   },
//   {
//     period: "February 2023 – May 2023",
//     role: "Internship",
//     company: "IntelliCloud Apps Private Limited",
//     location: "India, Hyderabad",
//     description: "Worked on cloud application development and gained exposure to modern software development practices.",
//     achievements: [
//       "Developed features for cloud-based applications",
//       "Collaborated with senior developers on code optimization",
//       "Participated in agile development processes",
//     ],
//     skills: ["Cloud Computing", "Software Development", "Agile Methodologies"],
//   },
// ];

// const Experience = () => {
//   const [activeIndex, setActiveIndex] = useState<number | null>(null);

//   return (
//     <section id="experience" className="py-24 px-4 bg-gradient-to-br from-background to-muted/20">
//       <div className="container max-w-6xl mx-auto">
//         <div className="text-center mb-16">
//           <span className="text-primary font-semibold text-sm uppercase tracking-wider">Career Journey</span>
//           <h2 className="text-4xl md:text-5xl font-bold mt-2 mb-4">
//             Work <span className="text-gradient">Experience</span>
//           </h2>
//           <p className="text-muted-foreground max-w-2xl mx-auto">
//             Building expertise through diverse challenges and continuous growth
//           </p>
//         </div>

//         <div className="relative">
//           {/* Timeline line */}
//           <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-primary/30 via-primary/50 to-primary/30 md:-translate-x-1/2 rounded-full" />

//           <div className="space-y-12">
//             {experiences.map((exp, index) => (
//               <div
//                 key={exp.role}
//                 className={`relative grid md:grid-cols-2 gap-8 ${
//                   index % 2 === 0 ? "" : "md:grid-flow-dense"
//                 }`}
//                 onMouseEnter={() => setActiveIndex(index)}
//                 onMouseLeave={() => setActiveIndex(null)}
//               >
//                 {/* Timeline dot */}
//                 <div className={`absolute left-0 md:left-1/2 w-6 h-6 rounded-full border-4 border-background md:-translate-x-1/2 z-10 transition-all duration-300 ${
//                   activeIndex === index ? 'bg-primary scale-125' : 'bg-primary/50'
//                 }`} />

//                 {/* Period (left on desktop) */}
//                 <div className={`${index % 2 === 0 ? "md:text-right" : "md:col-start-2"} pl-10 md:pl-0`}>
//                   <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary font-semibold text-sm backdrop-blur-sm">
//                     {exp.period}
//                   </span>
//                 </div>

//                 {/* Content */}
//                 <div className={`${index % 2 === 0 ? "" : "md:col-start-1"} pl-10 md:pl-8 ${index % 2 === 1 ? "md:pr-8 md:pl-0" : ""}`}>
//                   <div className={`p-6 rounded-2xl bg-card border border-border transition-all duration-300 ${
//                     activeIndex === index 
//                       ? 'shadow-lg border-primary/30 bg-gradient-to-br from-card to-primary/5' 
//                       : 'hover:border-primary/20 hover:shadow-md'
//                   }`}>
//                     <div className="flex flex-col md:flex-row md:items-start justify-between mb-4">
//                       <div>
//                         <h3 className="text-2xl font-bold mb-1">{exp.role}</h3>
//                         <p className="text-primary font-medium mb-1">{exp.company}</p>
//                         <p className="text-muted-foreground text-sm flex items-center">
//                           <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
//                           </svg>
//                           {exp.location}
//                         </p>
//                       </div>
//                       <div className="mt-2 md:mt-0 flex flex-wrap gap-1">
//                         {exp.skills.map((skill) => (
//                           <span key={skill} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
//                             {skill}
//                           </span>
//                         ))}
//                       </div>
//                     </div>

//                     <p className="text-muted-foreground mb-4 leading-relaxed">
//                       {exp.description}
//                     </p>

//                     <div className="space-y-2">
//                       <p className="text-sm font-semibold">Key Achievements:</p>
//                       <ul className="space-y-2">
//                         {exp.achievements.map((achievement) => (
//                           <li key={achievement} className="flex items-start text-sm text-muted-foreground">
//                             <span className="w-2 h-2 rounded-full bg-primary mt-1.5 mr-2 flex-shrink-0" />
//                             {achievement}
//                           </li>
//                         ))}
//                       </ul>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default Experience;




///////////

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Briefcase, Calendar, Award, Code } from 'lucide-react';

interface Experience {
  id: string;
  company: string;
  role: string;
  period: string;
  details: string[];
  skills_used: string[];
}

const Experience = ({ tenantId }: { tenantId?: string }) => {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    fetchExperience();

    const channel = supabase
      .channel("experience-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "experience" }, () => {
        fetchExperience();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tenantId]);

  const fetchExperience = async () => {
    let query = supabase.from("experience").select("*").order("created_at", { ascending: false });

    if (tenantId) {
      query = query.eq("tenant_id", tenantId);
    }

    const { data } = await query;
    if (data) setExperiences(data);
  };

  return (
    <section id="experience" className="py-24 px-4 bg-gradient-to-br from-background to-muted/20">
      <div className="container max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">Career Journey</span>
          <h2 className="text-4xl md:text-5xl font-bold mt-2 mb-4">
            Work <span className="text-gradient">Experience</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Building expertise through diverse challenges and continuous growth
          </p>
        </div>

        <div className="relative">
          <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-primary/30 via-primary/50 to-primary/30 md:-translate-x-1/2 rounded-full" />

          <div className="space-y-12">
            {experiences.map((exp, index) => (
              <div
                key={exp.id}
                className={`relative grid md:grid-cols-2 gap-8 ${index % 2 === 0 ? "" : "md:grid-flow-dense"}`}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                <div
                  className={`absolute left-0 md:left-1/2 w-6 h-6 rounded-full border-4 border-background md:-translate-x-1/2 z-10 transition-all duration-300 ${activeIndex === index ? "bg-primary scale-125" : "bg-primary/50"
                    }`}
                />

                <div className={`${index % 2 === 0 ? "md:text-right" : "md:col-start-2"} pl-10 md:pl-0`}>
                  <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary font-semibold text-sm backdrop-blur-sm">
                    <Calendar className="w-4 h-4 mr-2" />
                    {exp.period}
                  </div>
                </div>

                <div
                  className={`${index % 2 === 0 ? "" : "md:col-start-1"} pl-10 md:pl-8 ${index % 2 === 1 ? "md:pr-8 md:pl-0" : ""
                    }`}
                >
                  <div
                    className={`p-6 rounded-2xl bg-card border border-border transition-all duration-300 ${activeIndex === index
                      ? "shadow-lg border-primary/30 bg-gradient-to-br from-card to-primary/5"
                      : "hover:border-primary/20 hover:shadow-md"
                      }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center mb-2">
                          <Briefcase className="w-5 h-5 text-primary mr-2" />
                          <h3 className="text-2xl font-bold">{exp.role}</h3>
                        </div>
                        <p className="text-primary font-medium mb-1">{exp.company}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center mb-2">
                          <Award className="w-4 h-4 text-primary mr-2" />
                          <p className="text-sm font-semibold">Key Highlights:</p>
                        </div>
                        <ul className="space-y-2 ml-6">
                          {exp.details?.map((detail, i) => (
                            <li key={i} className="flex items-start text-sm text-muted-foreground">
                              <span className="w-2 h-2 rounded-full bg-primary mt-1.5 mr-2 flex-shrink-0" />
                              {detail}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <div className="flex items-center mb-2">
                          <Code className="w-4 h-4 text-primary mr-2" />
                          <p className="text-sm font-semibold">Skills & Technologies:</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {exp.skills_used?.map((skill, i) => (
                            <span
                              key={i}
                              className="px-3 py-1 bg-primary/10 text-primary text-xs rounded-full hover:bg-primary/20 transition-colors"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Experience;