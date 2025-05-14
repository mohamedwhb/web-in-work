"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building, Mail, Phone, Globe, MapPin, CreditCard } from "lucide-react"
import type { CompanyInfo } from "@/components/company-info-form"

export function CompanyInfoPreview() {
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null)
  const [companyLogo, setCompanyLogo] = useState<string | null>(null)

  // Load company info and logo from localStorage on component mount
  useEffect(() => {
    const savedCompanyInfo = localStorage.getItem("companyInfo")
    const savedCompanyLogo = localStorage.getItem("companyLogo")

    if (savedCompanyInfo) {
      try {
        setCompanyInfo(JSON.parse(savedCompanyInfo))
      } catch (error) {
        console.error("Error parsing saved company info:", error)
      }
    }

    if (savedCompanyLogo) {
      setCompanyLogo(savedCompanyLogo)
    }
  }, [])

  if (!companyInfo) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Vorschau</CardTitle>
          <CardDescription>Keine Firmendaten gefunden. Bitte füllen Sie das Formular aus.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vorschau</CardTitle>
        <CardDescription>So werden Ihre Firmendaten in Dokumenten angezeigt.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="p-6 border rounded-md bg-white">
          <div className="flex flex-col md:flex-row gap-4 items-start">
            {companyLogo && (
              <div className="flex-shrink-0 w-32">
                <img
                  src={companyLogo || "/placeholder.svg"}
                  alt={`${companyInfo.name} Logo`}
                  className="max-w-full h-auto"
                />
              </div>
            )}

            <div className="flex-grow space-y-4">
              <div>
                <h2 className="text-xl font-bold flex items-center">
                  <Building className="inline-block mr-2 h-5 w-5 text-primary" />
                  {companyInfo.name}
                  {companyInfo.legalForm && ` ${companyInfo.legalForm}`}
                </h2>
                {companyInfo.vatId && <p className="text-sm text-muted-foreground">UID-Nr.: {companyInfo.vatId}</p>}
                {companyInfo.registrationNumber && (
                  <p className="text-sm text-muted-foreground">FN: {companyInfo.registrationNumber}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <h3 className="text-sm font-medium flex items-center">
                    <MapPin className="inline-block mr-1 h-4 w-4 text-primary" />
                    Adresse
                  </h3>
                  <p className="text-sm">
                    {companyInfo.street} {companyInfo.number}
                    <br />
                    {companyInfo.zip} {companyInfo.city}
                    <br />
                    {companyInfo.country}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium flex items-center">
                    <Phone className="inline-block mr-1 h-4 w-4 text-primary" />
                    Kontakt
                  </h3>
                  <p className="text-sm">
                    Tel: {companyInfo.phone}
                    <br />
                    {companyInfo.fax && (
                      <>
                        Fax: {companyInfo.fax}
                        <br />
                      </>
                    )}
                    <span className="flex items-center">
                      <Mail className="inline-block mr-1 h-3 w-3 text-primary" />
                      {companyInfo.email}
                    </span>
                    {companyInfo.website && (
                      <span className="flex items-center">
                        <Globe className="inline-block mr-1 h-3 w-3 text-primary" />
                        {companyInfo.website.replace(/^https?:\/\//, "")}
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {(companyInfo.bankName || companyInfo.iban) && (
                <div>
                  <h3 className="text-sm font-medium flex items-center">
                    <CreditCard className="inline-block mr-1 h-4 w-4 text-primary" />
                    Bankverbindung
                  </h3>
                  <p className="text-sm">
                    {companyInfo.bankName && (
                      <>
                        Bank: {companyInfo.bankName}
                        <br />
                      </>
                    )}
                    {companyInfo.bankAccountHolder && (
                      <>
                        Kontoinhaber: {companyInfo.bankAccountHolder}
                        <br />
                      </>
                    )}
                    {companyInfo.iban && (
                      <>
                        IBAN: {companyInfo.iban}
                        <br />
                      </>
                    )}
                    {companyInfo.bic && <>BIC: {companyInfo.bic}</>}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
