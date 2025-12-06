import Link from "next/link";
import {
  Search,
  BookOpen,
  Users,
  Star,
  MessageSquare,
  Calendar,
  Award,
  TrendingUp,
} from "lucide-react";

export default function HomePage() {
  const categories = [
    { name: "Mathematics", icon: "🔢", slug: "mathematics" },
    { name: "English", icon: "📖", slug: "english" },
    { name: "Spanish", icon: "🇪🇸", slug: "spanish" },
    { name: "Programming", icon: "💻", slug: "programming" },
    { name: "Physics", icon: "⚛️", slug: "physics" },
    { name: "Music", icon: "🎵", slug: "music" },
    { name: "Art", icon: "🎨", slug: "art" },
    { name: "Business", icon: "💼", slug: "business" },
  ];

  const features = [
    {
      icon: <Users className="w-8 h-8" />,
      title: "Expert Tutors",
      description:
        "Learn from certified tutors with years of teaching experience",
    },
    {
      icon: <Calendar className="w-8 h-8" />,
      title: "Flexible Schedule",
      description: "Book lessons at times that work best for you",
    },
    {
      icon: <MessageSquare className="w-8 h-8" />,
      title: "Real-time Chat",
      description: "Message your tutor anytime for quick questions",
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: "Proven Results",
      description: "Join thousands of successful students worldwide",
    },
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Student",
      content:
        "Found an amazing Spanish tutor! My conversation skills improved dramatically in just 3 months.",
      rating: 5,
    },
    {
      name: "Mike Chen",
      role: "Student",
      content:
        "The tutors are professional and patient. Highly recommend for anyone learning programming.",
      rating: 5,
    },
    {
      name: "Emma Davis",
      role: "Student",
      content:
        "Flexible scheduling made it easy to fit lessons into my busy work schedule. Great platform!",
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 sticky top-0 bg-white/95 backdrop-blur-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link
              href="/"
              className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Hussamly
            </Link>
            <nav className="hidden md:flex items-center space-x-8">
              <Link
                href="/tutors"
                className="text-gray-700 hover:text-purple-600 transition">
                Find Tutors
              </Link>
              <Link
                href="/register"
                className="text-gray-700 hover:text-purple-600 transition">
                Become a Tutor
              </Link>
              <Link
                href="/login"
                className="text-gray-700 hover:text-purple-600 transition">
                Sign In
              </Link>
              <Link
                href="/register"
                className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-2 rounded-lg hover:from-purple-700 hover:to-purple-800 transition">
                Get Started
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Find Your Perfect{" "}
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Online Tutor
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Connect with expert tutors for personalized 1-on-1 lessons. Learn
              at your own pace, on your schedule.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="What do you want to learn?"
                  className="w-full pl-12 pr-4 py-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                />
              </div>
              <Link
                href="/tutors"
                className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-8 py-4 rounded-lg font-semibold hover:from-purple-700 hover:to-purple-800 transition whitespace-nowrap">
                Find Tutors
              </Link>
            </div>

            <div className="mt-8 flex items-center justify-center gap-8 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span>4.9/5 average rating</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                <span>10,000+ tutors</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Popular Subjects
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/tutors?subject=${category.slug}`}
                className="group p-6 bg-white border-2 border-gray-200 rounded-xl hover:border-purple-500 hover:shadow-lg transition">
                <div className="text-4xl mb-3">{category.icon}</div>
                <h3 className="font-semibold text-gray-900 group-hover:text-purple-600 transition">
                  {category.name}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Choose Us
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 text-purple-600 rounded-full mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            What Our Students Say
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <p className="text-gray-700 mb-4">{testimonial.content}</p>
                <div>
                  <p className="font-semibold text-gray-900">
                    {testimonial.name}
                  </p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-purple-600 to-pink-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl border border-white/20">
              <h3 className="text-2xl font-bold text-white mb-4">
                For Students
              </h3>
              <p className="text-white/90 mb-6">
                Start learning today with expert tutors from around the world
              </p>
              <Link
                href="/tutors"
                className="inline-block bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
                Find a Tutor
              </Link>
            </div>

            <div className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl border border-white/20">
              <h3 className="text-2xl font-bold text-white mb-4">For Tutors</h3>
              <p className="text-white/90 mb-6">
                Share your knowledge and earn money teaching what you love
              </p>
              <Link
                href="/register"
                className="inline-block bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
                Become a Tutor
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h4 className="text-white font-bold text-lg mb-4">Hussamly</h4>
              <p className="text-sm">
                Connecting students with expert tutors worldwide
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">For Students</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/tutors"
                    className="hover:text-white transition">
                    Find Tutors
                  </Link>
                </li>
                <li>
                  <Link
                    href="/login"
                    className="hover:text-white transition">
                    Student Login
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">For Tutors</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/register"
                    className="hover:text-white transition">
                    Become a Tutor
                  </Link>
                </li>
                <li>
                  <Link
                    href="/login"
                    className="hover:text-white transition">
                    Tutor Login
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="#"
                    className="hover:text-white transition">
                    About Us
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-white transition">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-center">
            <p>
              &copy; 2024 Hussamly. All rights reserved. Built with Next.js &
              Supabase.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
