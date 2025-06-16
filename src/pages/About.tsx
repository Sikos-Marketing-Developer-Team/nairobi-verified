import React from 'react';
import { Shield, MapPin, Users, Star, CheckCircle, Award } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Link } from 'react-router-dom';
import { usePageLoading } from '@/hooks/use-loading';
import { PageSkeleton } from '@/components/ui/loading-skeletons';
import { Skeleton } from '@/components/ui/skeleton';

const About = () => {
  const isLoading = usePageLoading(600);
  const stats = [
    { label: 'Verified Merchants', value: '200+', icon: Shield },
    { label: 'Happy Customers', value: '10,000+', icon: Users },
    { label: 'CBD Locations', value: '150+', icon: MapPin },
    { label: 'Average Rating', value: '4.8', icon: Star }
  ];

  const values = [
    {
      icon: Shield,
      title: 'Trust & Verification',
      description: 'Every merchant undergoes thorough verification including business registration and physical location confirmation.'
    },
    {
      icon: MapPin,
      title: 'Physical Presence',
      description: 'All merchants have verified physical stores in Nairobi CBD that customers can visit and verify.'
    },
    {
      icon: CheckCircle,
      title: 'Quality Assurance',
      description: 'We ensure all products meet quality standards and provide buyer protection for every purchase.'
    },
    {
      icon: Award,
      title: 'Local Focus',
      description: 'Supporting local businesses in Nairobi CBD while providing customers with trusted shopping experiences.'
    }
  ];

  const team = [
    {
      name: 'Sarah Mwangi',
      role: 'CEO & Founder',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop',
      description: 'Former e-commerce executive with 10+ years in Kenya\'s retail industry.'
    },
    {
      name: 'David Kiprotich',
      role: 'CTO',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop',
      description: 'Tech entrepreneur focused on building trust through technology solutions.'
    },
    {
      name: 'Grace Nyong\'o',
      role: 'Head of Merchant Relations',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
      description: 'Expert in business development and merchant partnership strategies.'
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        
        {/* Hero Section Skeleton */}
        <section className="gradient-bg py-16">
          <div className="max-w-4xl mx-auto text-center px-4">
            <Skeleton className="h-12 w-3/4 mx-auto mb-6" />
            <Skeleton className="h-6 w-full mb-4" />
            <Skeleton className="h-6 w-5/6 mx-auto mb-8" />
            <Skeleton className="h-12 w-48 mx-auto" />
          </div>
        </section>

        <PageSkeleton>
          <div className="space-y-16">
            {/* Stats Section Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="text-center space-y-4">
                  <Skeleton className="h-16 w-16 rounded-full mx-auto" />
                  <Skeleton className="h-8 w-20 mx-auto" />
                  <Skeleton className="h-6 w-32 mx-auto" />
                </div>
              ))}
            </div>

            {/* Values Section Skeleton */}
            <div className="space-y-8">
              <div className="text-center space-y-4">
                <Skeleton className="h-10 w-1/3 mx-auto" />
                <Skeleton className="h-6 w-2/3 mx-auto" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="space-y-4">
                    <Skeleton className="h-12 w-12" />
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                  </div>
                ))}
              </div>
            </div>

            {/* Team Section Skeleton */}
            <div className="space-y-8">
              <div className="text-center space-y-4">
                <Skeleton className="h-10 w-1/3 mx-auto" />
                <Skeleton className="h-6 w-2/3 mx-auto" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="text-center space-y-4">
                    <Skeleton className="h-32 w-32 rounded-full mx-auto" />
                    <Skeleton className="h-6 w-3/4 mx-auto" />
                    <Skeleton className="h-4 w-2/3 mx-auto" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </PageSkeleton>
        
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="gradient-bg py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-6xl font-bold inter text-gray-900 mb-6">
            About <span className="text-primary">Nairobi Verified</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We're bridging the gap between online shopping and physical retail in Nairobi's CBD, 
            creating a trusted marketplace where every merchant is verified and every customer is protected.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="h-8 w-8 text-primary" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold inter text-gray-900 mb-6">
                Our Story
              </h2>
              <div className="space-y-4 text-gray-700 text-lg">
                <p>
                  Nairobi Verified was born from a simple observation: many Kenyans were hesitant 
                  to shop online because they couldn't verify the legitimacy of merchants and products.
                </p>
                <p>
                  Founded in 2024, we set out to solve this trust gap by creating the first 
                  e-commerce platform in Kenya where every merchant is verified with a physical 
                  location that customers can visit.
                </p>
                <p>
                  Today, we're proud to serve thousands of customers and hundreds of verified 
                  merchants across Nairobi's Central Business District, creating economic 
                  opportunities while building trust in digital commerce.
                </p>
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=600&h=400&fit=crop"
                alt="Nairobi CBD"
                className="rounded-lg shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold inter text-gray-900 mb-4">
              Our Values
            </h2>
            <p className="text-xl text-gray-600">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="text-center hover-scale">
                <CardContent className="p-6">
                  <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <value.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {value.title}
                  </h3>
                  <p className="text-gray-600">
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold inter text-gray-900 mb-4">
              Meet Our Team
            </h2>
            <p className="text-xl text-gray-600">
              The passionate individuals building the future of trusted e-commerce in Kenya
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="text-center hover-scale">
                <CardContent className="p-6">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
                  />
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">
                    {member.name}
                  </h3>
                  <p className="text-primary font-medium mb-3">{member.role}</p>
                  <p className="text-gray-600">{member.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold inter text-white mb-4">
            Ready to Join Our Community?
          </h2>
          <p className="text-xl text-white max-w-3xl mx-auto mb-8">
            Become a verified merchant or start shopping with confidence today.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button asChild className="bg-white text-primary hover:bg-gray-100 px-8 py-3 text-lg">
              <Link to="/auth/register/merchant">Become a Merchant</Link>
            </Button>
            <Button asChild variant="outline" className="border-white text-white bg-text-primary hover:bg-gray-100 hover:text-primary px-8 py-3 text-lg">
              <Link to="/merchants">Explore Merchants</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Contact Us Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold inter text-gray-900 mb-4">
            Get in Touch
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Have questions or need support? We're here to help.
          </p>
          <Button asChild className="bg-primary hover:bg-primary-dark text-white px-8 py-3 text-lg">
            <a href="mailto:support@nairobihub.com">Contact Support</a>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
