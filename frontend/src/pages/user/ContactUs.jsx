import { useState } from 'react';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock, FaPrescriptionBottle } from 'react-icons/fa';
import Swal from 'sweetalert2';

function Contact() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle form submission
        console.log(formData);
        Swal.fire({
            icon: 'success',
            title: 'Message Sent!',
            text: 'Thank you for contacting MedCare Pharmacy. We will get back to you soon.',
            timer: 3000,
            showConfirmButton: false
        });
        setFormData({
            name: '',
            email: '',
            subject: '',
            message: ''
        });
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold text-gray-900">Contact MedCare Pharmacy</h1>
                    <p className="mt-4 text-xl text-gray-600">
                        Have questions about your prescriptions or need healthcare advice? We're here to help.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Contact Information */}
                    <div className="bg-[#2c8ba3]/10 p-8 rounded-lg">
                        <h2 className="text-2xl font-semibold mb-6">Get in Touch</h2>

                        <div className="space-y-6">
                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    <FaMapMarkerAlt className="h-6 w-6 text-[#2c8ba3]" />
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-lg font-medium">Pharmacy Location</h3>
                                    <p className="mt-1 text-gray-600">
                                        123 Healthcare Avenue<br />
                                        Medical District, NY 10001
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    <FaPhone className="h-6 w-6 text-[#2c8ba3]" />
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-lg font-medium">Phone</h3>
                                    <p className="mt-1 text-gray-600">
                                        Main: +1 (555) 123-4567<br />
                                        Prescription: +1 (555) 123-4568
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    <FaEnvelope className="h-6 w-6 text-[#2c8ba3]" />
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-lg font-medium">Email</h3>
                                    <p className="mt-1 text-gray-600">
                                        info@medcare.com<br />
                                        prescriptions@medcare.com
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    <FaClock className="h-6 w-6 text-[#2c8ba3]" />
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-lg font-medium">Hours of Operation</h3>
                                    <p className="mt-1 text-gray-600">
                                        Monday - Friday: 8:00 AM - 8:00 PM<br />
                                        Saturday: 9:00 AM - 6:00 PM<br />
                                        Sunday: 10:00 AM - 4:00 PM
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    <FaPrescriptionBottle className="h-6 w-6 text-[#2c8ba3]" />
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-lg font-medium">Prescription Services</h3>
                                    <p className="mt-1 text-gray-600">
                                        For prescription refills, please call or use our online prescription service.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="bg-white p-8 shadow-lg rounded-lg">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    id="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#2c8ba3] focus:ring-[#2c8ba3]"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    id="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#2c8ba3] focus:ring-[#2c8ba3]"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                                    Subject
                                </label>
                                <select
                                    name="subject"
                                    id="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#2c8ba3] focus:ring-[#2c8ba3]"
                                    required
                                >
                                    <option value="">Select a subject</option>
                                    <option value="Prescription Inquiry">Prescription Inquiry</option>
                                    <option value="Product Information">Product Information</option>
                                    <option value="Pharmacy Services">Pharmacy Services</option>
                                    <option value="General Question">General Question</option>
                                    <option value="Feedback">Feedback</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                                    Message
                                </label>
                                <textarea
                                    name="message"
                                    id="message"
                                    rows={4}
                                    value={formData.message}
                                    onChange={handleChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#2c8ba3] focus:ring-[#2c8ba3]"
                                    required
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-[#2c8ba3] text-white py-2 px-4 rounded-md hover:bg-[#2c8ba3]/90 focus:outline-none focus:ring-2 focus:ring-[#2c8ba3] focus:ring-offset-2"
                            >
                                Send Message
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Contact;