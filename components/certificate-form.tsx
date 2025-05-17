"use client"

import type { CertificateTemplate } from "@/lib/types"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ColorPicker } from "./color-picker"

interface CertificateFormProps {
  template: CertificateTemplate
  onTemplateChange: (template: Partial<CertificateTemplate>) => void
}

export function CertificateForm({ template, onTemplateChange }: CertificateFormProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2 mt-40">
        <Label htmlFor="title">Certificate Title</Label>
        <Input
          id="title"
          value={template.title}
          onChange={(e) => onTemplateChange({ title: e.target.value })}
          placeholder="Certificate of Achievement"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="subtitle">Subtitle (Optional)</Label>
        <Input
          id="subtitle"
          value={template.subtitle}
          onChange={(e) => onTemplateChange({ subtitle: e.target.value })}
          placeholder="For successfully completing the program"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">Certificate Message</Label>
        <Textarea
          id="message"
          value={template.message}
          onChange={(e) => onTemplateChange({ message: e.target.value })}
          placeholder="This is to certify that [name] has successfully completed the [course] program."
          rows={3}
        />
        <p className="text-xs text-slate-500">Use [name], [id], [course], [grade], [date] as placeholders for recipient data</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="signatory">Signatory Name</Label>
        <Input
          id="signatory"
          value={template.signatory}
          onChange={(e) => onTemplateChange({ signatory: e.target.value })}
          placeholder="John Doe"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="signatoryTitle">Signatory Title</Label>
        <Input
          id="signatoryTitle"
          value={template.signatoryTitle}
          onChange={(e) => onTemplateChange({ signatoryTitle: e.target.value })}
          placeholder="Program Director"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="dateFormat">Date Format</Label>
        <Select value={template.dateFormat} onValueChange={(value) => onTemplateChange({ dateFormat: value })}>
          <SelectTrigger id="dateFormat">
            <SelectValue placeholder="Select date format" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="MMMM d, yyyy">May 15, 2025</SelectItem>
            <SelectItem value="d MMMM yyyy">15 May 2025</SelectItem>
            <SelectItem value="MM/dd/yyyy">05/15/2025</SelectItem>
            <SelectItem value="dd/MM/yyyy">15/05/2025</SelectItem>
            <SelectItem value="yyyy-MM-dd">2025-05-15</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Primary Color</Label>
        <ColorPicker
          color={template.primaryColor}
          onChange={(color) => onTemplateChange({ primaryColor: color })}
          presetColors={["#0f2e4d", "#1a4a7c", "#2563eb", "#0369a1", "#0c4a6e"]}
        />
      </div>

      <div className="space-y-2">
        <Label>Secondary Color</Label>
        <ColorPicker
          color={template.secondaryColor}
          onChange={(color) => onTemplateChange({ secondaryColor: color })}
          presetColors={["#0ea5e9", "#38bdf8", "#7dd3fc", "#e0f2fe", "#f0f9ff"]}
        />
      </div>

      <div className="space-y-2">
        <Label>Border Style</Label>
        <Select value={template.borderStyle} onValueChange={(value) => onTemplateChange({ borderStyle: value as any })}>
          <SelectTrigger>
            <SelectValue placeholder="Select border style" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="classic">Classic</SelectItem>
            <SelectItem value="modern">Modern</SelectItem>
            <SelectItem value="minimal">Minimal</SelectItem>
            <SelectItem value="ornate">Ornate</SelectItem>
            <SelectItem value="none">None</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="showLogo">Show Organization Logo</Label>
        <Switch
          id="showLogo"
          checked={template.showLogo}
          onCheckedChange={(checked) => onTemplateChange({ showLogo: checked })}
        />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="showQrCode">Include QR Code</Label>
        <Switch
          id="showQrCode"
          checked={template.showQrCode}
          onCheckedChange={(checked) => onTemplateChange({ showQrCode: checked })}
        />
      </div>
    </div>
  )
}
