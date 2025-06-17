import { UserCircleIcon, HeartIcon, StarIcon, AcademicCapIcon } from '@heroicons/react/24/solid';

function About() {
    return (
        <div className="bg-white">
            <div className="max-w-7xl mx-auto px-4 py-12">
                {/* Hero Section */}
                <div className="text-center mb-16 relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#2c8ba3]/10 to-purple-100 opacity-30 rounded-3xl -z-10"></div>
                    <h1 className="text-5xl font-bold text-gray-900">
                        About MedCare Pharmacy
                    </h1>
                    <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
                        Your trusted neighborhood pharmacy, providing quality healthcare products and professional pharmaceutical services
                    </p>
                    <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
                        <img
                            src="https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80"
                            alt="Pharmacy counter"
                            className="rounded-xl object-cover h-48 w-full shadow-md"
                        />
                        <img
                            src="https://images.unsplash.com/photo-1584982751601-97dcc096659c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80"
                            alt="Pharmacy consultation"
                            className="rounded-xl object-cover h-48 w-full shadow-md"
                        />
                        <img
                            src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80"
                            alt="Healthcare products"
                            className="rounded-xl object-cover h-48 w-full shadow-md"
                        />
                        <img
                            src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80"
                            alt="Medical supplies"
                            className="rounded-xl object-cover h-48 w-full shadow-md"
                        />
                    </div>
                </div>

                {/* Mission Statement */}
                <div className="bg-gradient-to-r from-[#2c8ba3]/10 to-indigo-50 rounded-2xl p-8 mb-16 shadow-sm relative overflow-hidden">
                    <div className="absolute -right-20 -top-20 opacity-20">
                        <HeartIcon className="h-64 w-64 text-[#2c8ba3]" />
                    </div>
                    <div className="relative z-10">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Mission</h2>
                        <p className="text-gray-600 text-lg">
                            To provide accessible, high-quality pharmaceutical care and healthcare products that improve the well-being of our community. We are committed to offering professional guidance, reliable prescription services, and a comprehensive range of healthcare solutions.
                        </p>
                    </div>
                </div>

                {/* Services Section */}
                <div className="mb-16">
                    <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                        Our <span className="text-[#2c8ba3]">Services</span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {services.map((service, index) => (
                            <div key={index} className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100">
                                <div className="text-[#2c8ba3] mb-4">
                                    {service.icon}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">{service.title}</h3>
                                <p className="text-gray-600">{service.description}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Team Section */}
                <div className="mb-16">
                    <h2 className="text-3xl mt-20 font-bold text-gray-900 mb-12 text-center">
                        Our <span className="text-[#2c8ba3]">Pharmacy Team</span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {team.map((member) => (
                            <div
                                key={member.name}
                                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-gray-100"
                            >
                                <div className="p-6 flex justify-center">
                                    <img
                                        src={member.image}
                                        alt={member.name}
                                        className="h-32 w-32 rounded-full object-cover border-4 border-[#2c8ba3]/20"
                                    />
                                </div>
                                <div className="p-6 text-center border-t border-gray-100">
                                    <h3 className="text-xl font-bold text-gray-900">
                                        {member.name}
                                    </h3>
                                    <p className="text-[#2c8ba3] font-medium mt-1">{member.role}</p>
                                    <p className="mt-4 text-gray-600">{member.description}</p>
                                    <div className="mt-6 flex justify-center space-x-2">
                                        {member.specialties.map((specialty, index) => (
                                            <span
                                                key={index}
                                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#2c8ba3]/10 text-[#2c8ba3]"
                                            >
                                                {specialty}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

const services = [
    {
        title: 'Prescription Services',
        description: 'Fast and accurate prescription fulfillment with professional consultation and medication reviews.',
        icon: <AcademicCapIcon className="h-8 w-8" />
    },
    {
        title: 'Healthcare Products',
        description: 'Wide range of over-the-counter medications, vitamins, and healthcare supplies.',
        icon: <HeartIcon className="h-8 w-8" />
    },
    {
        title: 'Professional Consultation',
        description: 'Expert advice from licensed pharmacists on medications and health concerns.',
        icon: <UserCircleIcon className="h-8 w-8" />
    }
];

const team = [
    {
        name: 'Dr. Sarah Johnson',
        role: 'Lead Pharmacist',
        description: 'Licensed pharmacist with 15 years of experience in community pharmacy',
        specialties: ['Medication Management', 'Patient Counseling', 'Prescription Review'],
        image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80'
    },
    {
        name: 'Michael Chen',
        role: 'Pharmacy Manager',
        description: 'Experienced in pharmacy operations and customer service excellence',
        specialties: ['Inventory Management', 'Customer Service', 'Pharmacy Operations'],
        image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80'
    },
    {
        name: 'Dr. Emma Thompson',
        role: 'Clinical Pharmacist',
        description: 'Specialized in medication therapy management and patient care',
        specialties: ['Clinical Services', 'Medication Reviews', 'Health Consultations'],
        image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80'
    }
];

export default About;