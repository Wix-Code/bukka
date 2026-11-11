import Link from 'next/link';
import React from 'react'

const Footer = () => {
  return (
    <div>
      <footer className="border-t border-gray-200 bg-[#fffdf7]">
              <div className="mx-auto grid max-w-7xl gap-8 px-6 py-12 sm:grid-cols-2 md:grid-cols-4">
                <div>
                  <span className="text-lg font-bold text-gray-900">Bukka</span>
      
                  <p className="mt-3 max-w-[220px] text-sm leading-6 text-gray-500">
                    Digital menus and ordering tools for modern food businesses.
                  </p>
                </div>
      
                <FooterColumn
                  title="Product"
                  links={[
                    {
                      label: "Pricing",
                      href: "#pricing",
                    },
                    {
                      label: "Create my menu",
                      href: "/register",
                    },
                    {
                      label: "Log in",
                      href: "/login",
                    },
                  ]}
                />
      
                <FooterColumn
                  title="Company"
                  links={[
                    {
                      label: "About",
                      href: "#",
                    },
                    {
                      label: "Contact",
                      href: "#",
                    },
                  ]}
                />
      
                <FooterColumn
                  title="Legal"
                  links={[
                    {
                      label: "Privacy policy",
                      href: "#",
                    },
                    {
                      label: "Terms of service",
                      href: "#",
                    },
                  ]}
                />
              </div>
      
              <div className="border-t border-gray-200 py-6 text-center text-sm text-gray-500">
                &copy; {new Date().getFullYear()} Bukka. All rights reserved.
              </div>
            </footer>
    </div>
  )
}

export default Footer


function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: {
    label: string;
    href: string;
  }[];
}) {
  return (
    <div>
      <h4 className="font-medium text-gray-900">{title}</h4>

      <ul className="mt-3 space-y-2">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              href={link.href}
              className="text-sm text-gray-500 transition-colors hover:text-green-600"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
