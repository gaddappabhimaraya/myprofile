'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, Progress, Menu, Drawer, Typography, Space, Avatar, Divider, Row, Col, Tag } from 'antd';
import { 
  GithubOutlined, 
  LinkedinOutlined, 
  MailOutlined, 
  CodeOutlined,
  ThunderboltOutlined,
  GlobalOutlined,
  StarOutlined,
  MenuOutlined,
  CloseOutlined
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

// Custom hook to detect if an element is on screen for scroll animations
const useOnScreen = (options) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.unobserve(entry.target);
      }
    }, options);

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [ref, options]);

  return [ref, isVisible];
};

// Animated Background Component with Glassmorphism
const AnimatedBackground = () => {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    const particles = [];
    
    const init = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      // Create floating orbs
      for (let i = 0; i < 8; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          radius: Math.random() * 100 + 50,
          hue: Math.random() * 360,
          opacity: 0.1 + Math.random() * 0.1
        });
      }
    };
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        // Bounce off edges
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;
        
        // Create gradient
        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.radius
        );
        gradient.addColorStop(0, `hsla(${particle.hue}, 70%, 60%, ${particle.opacity})`);
        gradient.addColorStop(1, `hsla(${particle.hue}, 70%, 60%, 0)`);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fill();
      });
      
      animationFrameId = requestAnimationFrame(animate);
    };
    
    init();
    animate();
    
    const handleResize = () => init();
    window.addEventListener('resize', handleResize);
    
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />;
};

// Typewriter Effect Component
const TypewriterText = ({ text, speed = 100 }) => {
  const [displayText, setDisplayText] = useState('');
  
  useEffect(() => {
    let i = 0;
    const typingInterval = setInterval(() => {
      if (i < text.length) {
        setDisplayText(prev => prev + text.charAt(i));
        i++;
      } else {
        clearInterval(typingInterval);
      }
    }, speed);
    
    return () => clearInterval(typingInterval);
  }, [text, speed]);
  
  return (
    <span>
      {displayText}
      {displayText.length < text.length && (
        <span className="animate-pulse text-blue-400">|</span>
      )}
    </span>
  );
};

// Glassmorphism Card Component
const GlassCard = ({ children, className = '', ...props }) => {
  return (
    <Card
      className={`glassmorphism-card ${className}`}
      style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '20px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        ...props.style
      }}
      {...props}
    >
      {children}
    </Card>
  );
};

// Project Card Component
const ProjectCard = ({ project, index }) => {
  const [ref, isVisible] = useOnScreen({ threshold: 0.1 });
  
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}
      style={{ transitionDelay: `${index * 200}ms` }}
    >
      <GlassCard
        hoverable
        className="h-full project-card"
        style={{ height: '100%' }}
      >
        <div className="p-4">
          <div className="flex items-center mb-4">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center mr-4"
              style={{
                background: `linear-gradient(135deg, ${project.colors[0]}, ${project.colors[1]})`,
              }}
            >
              {project.icon}
            </div>
            <Title level={4} style={{ color: 'white', margin: 0 }}>
              {project.title}
            </Title>
          </div>
          
          <Paragraph style={{ color: 'rgba(255, 255, 255, 0.8)', marginBottom: '16px' }}>
            {project.description}
          </Paragraph>
          
          <div className="flex flex-wrap gap-2">
            {project.tech.map((tech) => (
              <Tag
                key={tech}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '12px'
                }}
              >
                {tech}
              </Tag>
            ))}
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

// Main Portfolio Component
const GaddeppaPortfolio = () => {
  const [activeSection, setActiveSection] = useState('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [skillProgress, setSkillProgress] = useState({});
  const [scrollY, setScrollY] = useState(0);
  
  const [skillsRef, skillsVisible] = useOnScreen({ threshold: 0.3 });
  
  // Handle scroll effects
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
      
      // Update active section based on scroll position
      const sections = ['home', 'skills', 'projects', 'contact'];
      const scrollPosition = window.scrollY + window.innerHeight / 2;
      
      for (const sectionId of sections) {
        const element = document.getElementById(sectionId);
        if (element && element.offsetTop <= scrollPosition) {
          setActiveSection(sectionId);
        }
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Animate skills when visible
  useEffect(() => {
    if (skillsVisible) {
      setTimeout(() => {
        setSkillProgress({
          'React': 95,
          'Next.js': 90,
          'Node.js': 88,
          'Python': 85,
          'MongoDB': 82,
          'AI/ML': 80
        });
      }, 300);
    }
  }, [skillsVisible]);
  
  const scrollToSection = (sectionId) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    setIsMenuOpen(false);
  };
  
  const navItems = [
    { key: 'home', label: 'Home' },
    { key: 'skills', label: 'Skills' },
    { key: 'projects', label: 'Projects' },
    { key: 'contact', label: 'Contact' }
  ];
  
  const skills = [
    { name: 'React', level: 95, color: '#61DAFB' },
    { name: 'Next.js', level: 90, color: '#000000' },
    { name: 'Node.js', level: 88, color: '#339933' },
    { name: 'Python', level: 85, color: '#3776AB' },
    { name: 'MongoDB', level: 82, color: '#47A248' },
    { name: 'AI/ML', level: 80, color: '#FF6B6B' }
  ];
  
  const projects = [
    {
      title: "AI-Powered Analytics Dashboard",
      description: "Advanced analytics platform with machine learning insights and real-time data visualization.",
      tech: ["React", "Python", "TensorFlow", "D3.js"],
      colors: ["#667eea", "#764ba2"],
      icon: <ThunderboltOutlined style={{ color: 'white', fontSize: '24px' }} />
    },
    {
      title: "Smart E-Commerce Platform",
      description: "Next-generation shopping experience with AI recommendations and seamless checkout.",
      tech: ["Next.js", "Node.js", "MongoDB", "Stripe"],
      colors: ["#f093fb", "#f5576c"],
      icon: <GlobalOutlined style={{ color: 'white', fontSize: '24px' }} />
    },
    {
      title: "Intelligent Code Assistant",
      description: "AI-powered coding companion that helps developers write better code faster.",
      tech: ["Python", "OpenAI", "React", "FastAPI"],
      colors: ["#4facfe", "#00f2fe"],
      icon: <CodeOutlined style={{ color: 'white', fontSize: '24px' }} />
    }
  ];
  
  return (
    <div className="min-h-screen relative overflow-x-hidden">
      {/* Animated Background */}
      <div
        className="fixed inset-0 z-0"
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      >
        <AnimatedBackground />
      </div>
      
      {/* Navigation */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
        }}
      >
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div
              className="flex items-center space-x-3 cursor-pointer"
              onClick={() => scrollToSection('home')}
            >
              <Avatar
                size={40}
                style={{
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <CodeOutlined style={{ color: 'white', fontSize: '20px' }} />
              </Avatar>
              <Title level={3} style={{ color: 'white', margin: 0 }}>
                Gaddeppa
              </Title>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex">
              <Menu
                mode="horizontal"
                selectedKeys={[activeSection]}
                className="bg-transparent border-0"
                style={{
                  background: 'transparent',
                  borderBottom: 'none',
                }}
                items={navItems.map(item => ({
                  key: item.key,
                  label: (
                    <span
                      className="text-white hover:text-blue-300 cursor-pointer px-4 py-2"
                      onClick={() => scrollToSection(item.key)}
                    >
                      {item.label}
                    </span>
                  )
                }))}
              />
            </div>
            
            {/* Mobile Menu Button */}
            <Button
              type="text"
              className="md:hidden text-white"
              icon={<MenuOutlined />}
              onClick={() => setIsMenuOpen(true)}
            />
          </div>
        </div>
      </nav>
      
      {/* Mobile Drawer */}
      <Drawer
        title={
          <span style={{ color: 'white' }}>Navigation</span>
        }
        placement="right"
        onClose={() => setIsMenuOpen(false)}
        open={isMenuOpen}
        className="mobile-drawer"
        style={{
          background: 'rgba(102, 126, 234, 0.9)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <Menu
          mode="vertical"
          selectedKeys={[activeSection]}
          className="bg-transparent border-0"
          items={navItems.map(item => ({
            key: item.key,
            label: (
              <span
                className="text-white text-lg cursor-pointer"
                onClick={() => scrollToSection(item.key)}
              >
                {item.label}
              </span>
            )
          }))}
        />
      </Drawer>
      
      {/* Main Content */}
      <main className="relative z-10 max-w-6xl mx-auto px-6 py-20">
        {/* Hero Section */}
        <section id="home" className="min-h-screen flex items-center justify-center text-center">
          <div
            className="transition-transform duration-500"
            style={{ transform: `translateY(${scrollY * 0.3}px)` }}
          >
            <GlassCard className="p-12 max-w-4xl">
              <Avatar
                size={120}
                className="mb-8 mx-auto"
                style={{
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <CodeOutlined style={{ color: 'white', fontSize: '48px' }} />
              </Avatar>
              
              <Title level={1} style={{ color: 'white', fontSize: '4rem', marginBottom: '16px' }}>
                <TypewriterText text="Gaddeppa" speed={150} />
              </Title>
              
              <Title level={2} style={{ color: 'rgba(255, 255, 255, 0.8)', fontWeight: 400, marginBottom: '24px' }}>
                <TypewriterText text="Full Stack Developer & AI Innovator" speed={80} />
              </Title>
              
              <Paragraph style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '18px', maxWidth: '600px', margin: '0 auto' }}>
                Crafting innovative digital experiences with cutting-edge technologies. 
                Specializing in AI-powered applications and modern web development.
              </Paragraph>
            </GlassCard>
          </div>
        </section>
        
        {/* Skills Section */}
        <section id="skills" ref={skillsRef} className="py-20">
          <Title level={1} style={{ color: 'white', textAlign: 'center', marginBottom: '48px' }}>
            Skills & Expertise
          </Title>
          
          <GlassCard>
            <div className="p-8">
              <Row gutter={[32, 32]}>
                {skills.map((skill, index) => (
                  <Col xs={24} md={12} key={skill.name}>
                    <div className="mb-6">
                      <div className="flex justify-between items-center mb-3">
                        <Text strong style={{ color: 'white', fontSize: '16px' }}>
                          {skill.name}
                        </Text>
                        <Text style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                          {skillProgress[skill.name] || 0}%
                        </Text>
                      </div>
                      <Progress
                        percent={skillProgress[skill.name] || 0}
                        strokeColor={{
                          '0%': skill.color,
                          '100%': skill.color + '80',
                        }}
                        trailColor="rgba(255, 255, 255, 0.1)"
                        strokeWidth={8}
                        showInfo={false}
                      />
                    </div>
                  </Col>
                ))}
              </Row>
            </div>
          </GlassCard>
        </section>
        
        {/* Projects Section */}
        <section id="projects" className="py-20">
          <Title level={1} style={{ color: 'white', textAlign: 'center', marginBottom: '48px' }}>
            Featured Projects
          </Title>
          
          <Row gutter={[24, 24]}>
            {projects.map((project, index) => (
              <Col xs={24} lg={8} key={index}>
                <ProjectCard project={project} index={index} />
              </Col>
            ))}
          </Row>
        </section>
        
        {/* Contact Section */}
        <section id="contact" className="py-20 text-center">
          <Title level={1} style={{ color: 'white', marginBottom: '24px' }}>
            Let&aposs Connect
          </Title>
          
          <Paragraph style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '18px', marginBottom: '48px' }}>
            Ready to bring your ideas to life? Let&aposs collaborate and create something amazing.
          </Paragraph>
          
          <GlassCard className="inline-block">
            <div className="p-8">
              <Space size="large" wrap>
                <Button
                  type="primary"
                  size="large"
                  icon={<LinkedinOutlined />}
                  href="https://www.linkedin.com/in/gaddeppa"
                  target="_blank"
                  style={{
                    background: '#0077B5',
                    borderColor: '#0077B5',
                    borderRadius: '12px',
                    height: '48px',
                    fontSize: '16px'
                  }}
                >
                  LinkedIn
                </Button>
                
                <Button
                  type="primary"
                  size="large"
                  icon={<GithubOutlined />}
                  href="https://github.com/gaddeppa"
                  target="_blank"
                  style={{
                    background: '#333',
                    borderColor: '#333',
                    borderRadius: '12px',
                    height: '48px',
                    fontSize: '16px'
                  }}
                >
                  GitHub
                </Button>
                
                <Button
                  type="primary"
                  size="large"
                  icon={<MailOutlined />}
                  href="mailto:gaddeppa@example.com"
                  style={{
                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                    borderColor: 'transparent',
                    borderRadius: '12px',
                    height: '48px',
                    fontSize: '16px'
                  }}
                >
                  Email
                </Button>
              </Space>
            </div>
          </GlassCard>
        </section>
      </main>
      
      {/* Custom Styles */}
      <style jsx global>{`
        .glassmorphism-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 16px 48px rgba(0, 0, 0, 0.2);
          transition: all 0.3s ease;
        }
        
        .project-card:hover {
          transform: translateY(-10px) scale(1.02);
          transition: all 0.4s ease;
        }
        
        .ant-menu-horizontal {
          background: transparent !important;
          border-bottom: none !important;
        }
        
        .ant-menu-item {
          border-bottom: 2px solid transparent !important;
        }
        
        .ant-menu-item-selected {
          color: #40a9ff !important;
          border-bottom: 2px solid #40a9ff !important;
        }
        
        .ant-drawer-content {
          background: rgba(102, 126, 234, 0.9) !important;
          backdrop-filter: blur(20px) !important;
        }
        
        .ant-progress-bg {
          transition: width 2s ease-out !important;
        }
        
        body {
          overflow-x: hidden;
        }
      `}</style>
    </div>
  );
};

export default GaddeppaPortfolio;
