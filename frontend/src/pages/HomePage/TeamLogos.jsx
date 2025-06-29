import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Play, Facebook, Instagram, MessageCircle } from 'lucide-react';

const Teamlogos = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Dữ liệu mẫu cho các team
  const teams = [
    {
      id: 1,
      name: 'Thunder Eagles',
      description: 'Nếu bạn muốn học cách chơi golf chuyên nghiệp, đội của chúng tôi luôn sẵn sàng giúp bạn yêu thích golf và dạy bạn cách chơi ở trình độ cao trong thời gian ngắn.',
      members: [
        {
          id: 1,
          name: 'John Lewis',
          image: 'https://cdn2.tuoitre.vn/471584752817336320/2024/8/29/ronaldo-1724892716720744160696.jpg',
          social: {
            facebook: '#',
            instagram: '#',
            zalo: '#'
          }
        },
        {
          id: 2,
          name: 'Mike Johnson',
          image: 'https://m.media-amazon.com/images/I/71PEkfFmxDL._AC_UF1000,1000_QL80_.jpg',
          social: {
            facebook: '#',
            instagram: '#',
            zalo: '#'
          }
        }
      ]
    },
    {
      id: 2,
      name: 'Fire Dragons',
      description: 'Đội của chúng tôi có nhiều năm kinh nghiệm trong việc huấn luyện và phát triển kỹ năng golf. Chúng tôi cam kết mang đến cho bạn những trải nghiệm tuyệt vời nhất.',
      members: [
        {
          id: 3,
          name: 'Jayne Lee',
          image: 'https://media.vov.vn/sites/default/files/styles/large/public/2023-05/kevin_de_bruyne.jpg',
          social: {
            facebook: '#',
            instagram: '#',
            zalo: '#'
          }
        },
        {
          id: 4,
          name: 'Sarah Wilson',
          image: 'https://c8.alamy.com/comp/ERR6MW/berlin-germany-6th-june-2015-neymar-barcelona-footballsoccer-neymar-ERR6MW.jpg',
          social: {
            facebook: '#',
            instagram: '#',
            zalo: '#'
          }
        }
      ]
    },
    {
      id: 3,
      name: 'Ocean Sharks',
      description: 'Với phương pháp giảng dạy hiện đại và cá nhân hóa, chúng tôi sẽ giúp bạn nhanh chóng cải thiện kỹ thuật và đạt được mục tiêu golf của mình.',
      members: [
        {
          id: 5,
          name: 'David Chen',
          image: 'https://cdnphoto.dantri.com.vn/gENJFkAILdp9CzCdVZ8pdYifFgw=/thumb_w/1020/2024/03/01/cong-phuong-5-1694448028163-1694845337269-1709294266312.jpg',
          social: {
            facebook: '#',
            instagram: '#',
            zalo: '#'
          }
        },
        {
          id: 6,
          name: 'Emily Rose',
          image: 'https://vcdn1-thethao.vnecdn.net/2025/01/18/nguyen-hoang-duc-asean-cup-202-5611-1980-1737180632.jpg?w=0&h=0&q=100&dpr=1&fit=crop&s=hqjUI-NZE8irxYQ9QGbRLg',
          social: {
            facebook: '#',
            instagram: '#',
            zalo: '#'
          }
        }
      ]
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % teams.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + teams.length) % teams.length);
  };

  const currentTeam = teams[currentSlide];

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 to-white py-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <p className="text-amber-600 text-sm font-semibold tracking-wider uppercase mb-2">
            OUR TEAM
          </p>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Meet Our Team
          </h1>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <p className="text-xl text-gray-600 leading-relaxed">
              {currentTeam.description}
            </p>

            {/* Action Buttons */}
            <div className="flex items-center space-x-6">
              <button className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-lg font-semibold transition-colors duration-200 flex items-center space-x-2">
                <span>About Us</span>
              </button>
              
              <button className="border-2 border-gray-300 hover:border-gray-400 text-gray-700 px-6 py-3 rounded-full font-medium transition-colors duration-200 flex items-center space-x-2">
                <Play className="w-5 h-5" />
                <span>Video Presentation</span>
              </button>
            </div>

            {/* Navigation */}
            <div className="flex items-center space-x-4 pt-8">
              <button
                onClick={prevSlide}
                className="p-3 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-200"
              >
                <ChevronLeft className="w-6 h-6 text-gray-600" />
              </button>
              
              <div className="flex space-x-2">
                {teams.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-3 h-3 rounded-full transition-colors duration-200 ${
                      index === currentSlide ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
              
              <button
                onClick={nextSlide}
                className="p-3 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-200"
              >
                <ChevronRight className="w-6 h-6 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Right Content - Team Members */}
          <div className="relative">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {currentTeam.members.map((member) => (
                <div key={member.id} className="group cursor-pointer">
                  {/* Member Image */}
                  {/* <div className="relative overflow-hidden mb-4 bg-gradient-to-br from-orange-100 to-orange-200 p-4 rounded-2xl"> */}
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-80 object-cover transition-transform duration-300 group-hover:scale-105 mb-6"
                    />
                  {/* </div> */}
                  
                  {/* Member Info */}
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-green-600 transition-colors duration-200">
                      {member.name}
                    </h3>
                    
                    {/* Social Icons */}
                    <div className="flex justify-center space-x-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <a
                        href={member.social.facebook}
                        className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors duration-200"
                        title="Facebook"
                      >
                        <Facebook className="w-4 h-4" />
                      </a>
                      
                      <a
                        href={member.social.instagram}
                        className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full hover:from-purple-600 hover:to-pink-600 transition-all duration-200"
                        title="Instagram"
                      >
                        <Instagram className="w-4 h-4" />
                      </a>
                      
                      <a
                        href={member.social.zalo}
                        className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors duration-200"
                        title="Zalo"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Teamlogos;