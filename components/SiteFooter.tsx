import { footerLinks, profile } from "../src/content/site.ts";

/* Shared by the homepage and every case study, so a visitor who arrives on a
   case study from search has the same navigation and contact route as one who
   arrives at the homepage. */
export default function SiteFooter() {
  return (
    <footer className="siteFooter">
      <div className="shell footerBar">
        <div className="brand">
          <span className="brandName">{profile.name}</span>
          <span className="brandRole">{profile.role}</span>
        </div>
        <nav className="footerNav" aria-label="Footer">
          {footerLinks.map((item) => (
            <a key={item.href} href={item.href}>{item.label}</a>
          ))}
          <a href={profile.github} target="_blank" rel="noopener noreferrer">GitHub</a>
          <a className="backToTop" href="#top">Back to top</a>
        </nav>
      </div>
    </footer>
  );
}
