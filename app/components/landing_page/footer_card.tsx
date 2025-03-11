const navigation = {
    support: [
      { name: 'Submit ticket', href: '#' },
      { name: 'Guides', href: '#' },
    ],
    company: [
      { name: 'About', href: '#' },
      { name: 'Jobs', href: '#' },
      { name: 'Press', href: '#' },
    ],
    legal: [
      { name: 'Terms of service', href: '#' },
      { name: 'Privacy policy', href: '#' },
      { name: 'License', href: '#' },
    ],
  }
  
  export default function Footer() {
    return (
      <footer className="bg-gray-900">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:py-24 lg:px-8 lg:py-32">
          <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <span className="-ml-0.5 size-5 text-md font-semibold text-white ">
                BlockVote
              </span>
            <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
              <div className="md:grid md:grid-cols-2 md:gap-8">
                <div className="mt-10 md:mt-0">
                  <h3 className="text-sm/6 font-semibold text-white">Support</h3>
                  <ul role="list" className="mt-6 space-y-4">
                    {navigation.support.map((item) => (
                      <li key={item.name}>
                        <a href={item.href} className="text-sm/6 text-gray-300 hover:text-white">
                          {item.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="md:grid md:grid-cols-2 md:gap-8">
                <div>
                  <h3 className="text-sm/6 font-semibold text-white">Company</h3>
                  <ul role="list" className="mt-6 space-y-4">
                    {navigation.company.map((item) => (
                      <li key={item.name}>
                        <a href={item.href} className="text-sm/6 text-gray-300 hover:text-white">
                          {item.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-10 md:mt-0">
                  <h3 className="text-sm/6 font-semibold text-white">Legal</h3>
                  <ul role="list" className="mt-6 space-y-4">
                    {navigation.legal.map((item) => (
                      <li key={item.name}>
                        <a href={item.href} className="text-sm/6 text-gray-300 hover:text-white">
                          {item.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    )
  }
  