import { ArrowRight, Building2, CalendarDays, Check, Info, Mail, MessageSquare, Phone, Rocket } from 'lucide-react'
import {
  contact as defaultContact,
  hasContactChannel,
  setupAudiences,
  type BookingKind,
  type ContactConfig,
} from '../../config/contact'
import { Button } from '../ui/Button'
import { LinkedInIcon } from '../ui/BrandIcons'
import { Reveal } from '../ui/Reveal'
import { SectionHeading } from '../ui/SectionHeading'

const audienceIcons = [Building2, Rocket]

function BookingIcon({ kind }: { kind: BookingKind }) {
  const cls = 'size-4'
  if (kind === 'linkedin') return <LinkedInIcon className={cls} data-icon="linkedin" />
  if (kind === 'teams') return <MessageSquare className={cls} aria-hidden="true" />
  return <CalendarDays className={cls} aria-hidden="true" />
}

/**
 * Contact card for IT solution setup. Rendered with the configured
 * contact details; tests pass their own `contact` to cover each state.
 */
export function ContactCard({ contact = defaultContact }: { contact?: ContactConfig }) {
  const configured = hasContactChannel(contact)
  const subject = encodeURIComponent('IT solution setup enquiry')

  return (
    <div className="surface-card grid overflow-hidden lg:grid-cols-[1.15fr_0.85fr]">
      <div className="p-6 sm:p-8">
        <ul className="grid gap-6 sm:grid-cols-2">
          {setupAudiences.map((a, i) => {
            const Icon = audienceIcons[i] ?? Building2
            return (
              <li key={a.title}>
                <span className="inline-flex size-10 items-center justify-center rounded-lg bg-accent-soft text-accent">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <h3 className="mt-4 font-semibold tracking-tight">{a.title}</h3>
                <p className="mt-1.5 text-[0.95rem] leading-relaxed text-muted">{a.description}</p>
                <ul className="mt-3 space-y-1.5">
                  {a.points.map((p) => (
                    <li key={p} className="flex items-start gap-2 text-sm text-muted">
                      <Check className="mt-0.5 size-3.5 shrink-0 text-ai" aria-hidden="true" />
                      {p}
                    </li>
                  ))}
                </ul>
              </li>
            )
          })}
        </ul>
      </div>

      <div className="relative flex flex-col justify-between border-t border-line bg-elevated p-6 sm:p-8 lg:border-l lg:border-t-0">
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: 'radial-gradient(70% 60% at 100% 0%, var(--hero-glow-a), transparent 70%)' }}
          aria-hidden="true"
        />
        <div className="relative">
          <h3 className="text-lg font-semibold tracking-tight">Get in touch</h3>
          <p className="mt-1 text-sm font-medium text-accent">{contact.name}</p>
          <p className="mt-3 text-[0.95rem] leading-relaxed text-muted">
            Tell us about your organisation, how many people and devices you run, and what you want IT to do better.
            We will suggest a setup and the applications that fit.
          </p>

          {configured ? (
            <ul className="mt-6 space-y-3">
              {contact.email && (
                <li>
                  <a
                    href={`mailto:${contact.email}?subject=${subject}`}
                    className="group flex items-center gap-3 rounded-md border border-line bg-surface px-4 py-3 transition-colors hover:border-accent/60"
                  >
                    <Mail className="size-4 text-accent" aria-hidden="true" />
                    <span className="flex-1">
                      <span className="block text-sm font-medium">Email</span>
                      <span className="block text-sm text-muted">{contact.email}</span>
                    </span>
                    <ArrowRight className="size-4 text-muted transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                  </a>
                </li>
              )}
              {contact.phone && (
                <li>
                  <a
                    href={contact.phone.href}
                    className="group flex items-center gap-3 rounded-md border border-line bg-surface px-4 py-3 transition-colors hover:border-accent/60"
                  >
                    <Phone className="size-4 text-accent" aria-hidden="true" />
                    <span className="flex-1">
                      <span className="block text-sm font-medium">Phone</span>
                      <span className="block text-sm text-muted">{contact.phone.display}</span>
                    </span>
                    <ArrowRight className="size-4 text-muted transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                  </a>
                </li>
              )}
              {contact.bookingUrl && (
                <li className="pt-1">
                  <Button href={contact.bookingUrl} target="_blank" rel="noopener noreferrer" size="lg" className="w-full">
                    <BookingIcon kind={contact.bookingKind} />
                    {contact.bookingLabel}
                  </Button>
                  <p className="mt-2 text-center text-xs text-faint">Opens in a new tab</p>
                </li>
              )}
            </ul>
          ) : (
            <p
              role="status"
              className="mt-6 flex items-start gap-3 rounded-md border border-line bg-surface p-4 text-sm leading-relaxed text-muted"
            >
              <Info className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
              Contact details for the setup team have not been added yet. The portal administrator can set an email,
              phone number or booking link in the portal configuration.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export function ContactSection() {
  return (
    <section className="container-x py-16 sm:py-20" aria-labelledby="contact">
      <Reveal>
        <SectionHeading
          id="contact"
          title="Set up IT solutions for your organisation"
          lead="Whether you are building IT for a new company, modernising an established enterprise, or getting a startup off the ground, the same platform and team can help."
        />
      </Reveal>
      <Reveal>
        <ContactCard />
      </Reveal>
    </section>
  )
}
