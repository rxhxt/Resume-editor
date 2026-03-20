"use client";

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import type { Resume, Section, SectionItem } from "@/types/resume";

// Styles matching the LaTeX template:
// - 0.5in left/right margins, 0.4in top, 0.5in bottom
// - \baselinestretch{0.82} → tight line spacing
// - \LARGE bold name, \small contact, \large\bfseries section titles with \titlerule
// - itemsep=1ex between bullets
const styles = StyleSheet.create({
  page: {
    paddingTop: 29, // 0.4in
    paddingLeft: 36, // 0.5in
    paddingRight: 36, // 0.5in
    paddingBottom: 36, // 0.5in
    fontSize: 10.5,
    fontFamily: "Helvetica",
    color: "#000",
    lineHeight: 1.0, // baselinestretch 0.82 × default 1.2 ≈ 0.98
  },
  header: {
    marginBottom: 4,
    textAlign: "center",
  },
  name: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    marginBottom: 6,
  },
  contactRow: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  contactItem: {
    fontSize: 8.5,
    color: "#000",
  },
  contactSeparator: {
    fontSize: 8.5,
    color: "#000",
  },
  section: {
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    borderBottomWidth: 0.8,
    borderBottomColor: "#000",
    paddingBottom: 2,
    marginBottom: 4,
    marginTop: 2,
  },
  item: {
    marginBottom: 4,
  },
  itemHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 0,
  },
  itemBoldText: {
    fontSize: 10.5,
    fontFamily: "Helvetica-Bold",
    maxWidth: "72%",
  },
  itemItalicText: {
    fontSize: 10.5,
    fontStyle: "italic",
    marginBottom: 1,
  },
  itemPlainText: {
    fontSize: 10.5,
  },
  itemDateText: {
    fontSize: 10.5,
    fontStyle: "italic",
    textAlign: "right",
    flexShrink: 0,
  },
  bullet: {
    flexDirection: "row",
    marginBottom: 4, // itemsep=1ex ≈ 4pt at 10.5pt
    paddingLeft: 10,
  },
  bulletDot: {
    width: 10,
    fontSize: 10.5,
  },
  bulletText: {
    flex: 1,
    fontSize: 10.5,
    lineHeight: 1.15,
  },
  summaryText: {
    fontSize: 10.5,
    lineHeight: 1.15,
  },
  skillRow: {
    fontSize: 10.5,
    marginBottom: 3,
    lineHeight: 1.15,
  },
  educationInline: {
    flexDirection: "row",
    fontSize: 10.5,
    marginTop: 1,
  },
});

function SummarySection({ section }: { section: Section }) {
  const allText = section.items
    .flatMap((item) => item.bullets.map((b) => b.text))
    .join(" ");

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      {allText && <Text style={styles.summaryText}>{allText}</Text>}
    </View>
  );
}

function SkillsSection({ section }: { section: Section }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      {section.items.map((item) => {
        const bulletsText = item.bullets.map((b) => b.text).join(", ");
        return (
          <View key={item.id} style={styles.skillRow}>
            <Text>
              <Text style={{ fontFamily: "Helvetica-Bold" }}>
                {item.title}:{" "}
              </Text>
              <Text>{bulletsText}</Text>
            </Text>
          </View>
        );
      })}
    </View>
  );
}

function EducationItem({ item }: { item: SectionItem }) {
  const gpaText = item.bullets.map((b) => b.text).join(", ");

  return (
    <View style={styles.item}>
      <View style={styles.itemHeaderRow}>
        <Text style={styles.itemBoldText}>{item.title}</Text>
        {item.dateRange && (
          <Text style={styles.itemDateText}>{item.dateRange}</Text>
        )}
      </View>
      <View style={styles.educationInline}>
        {item.subtitle && <Text>{item.subtitle}</Text>}
        {gpaText && (
          <Text>{"    "}{gpaText}</Text>
        )}
      </View>
    </View>
  );
}

function ExperienceItem({ item }: { item: SectionItem }) {
  const companyLine = [item.subtitle, item.location]
    .filter(Boolean)
    .join(", ");

  return (
    <View style={styles.item}>
      <View style={styles.itemHeaderRow}>
        <Text style={styles.itemBoldText}>{companyLine || item.subtitle}</Text>
        {item.dateRange && (
          <Text style={styles.itemDateText}>{item.dateRange}</Text>
        )}
      </View>
      {item.title && <Text style={styles.itemItalicText}>{item.title}</Text>}
      {item.bullets.map((bullet) => (
        <View key={bullet.id} style={styles.bullet}>
          <Text style={styles.bulletDot}>•</Text>
          <Text style={styles.bulletText}>{bullet.text}</Text>
        </View>
      ))}
    </View>
  );
}

function DefaultItem({ item }: { item: SectionItem }) {
  return (
    <View style={styles.item}>
      <View style={styles.itemHeaderRow}>
        <Text style={styles.itemBoldText}>{item.title}</Text>
        {item.dateRange && (
          <Text style={styles.itemDateText}>{item.dateRange}</Text>
        )}
      </View>
      {(item.subtitle || item.location) && (
        <View style={styles.itemHeaderRow}>
          {item.subtitle && (
            <Text style={styles.itemItalicText}>{item.subtitle}</Text>
          )}
          {item.location && (
            <Text style={styles.itemPlainText}>{item.location}</Text>
          )}
        </View>
      )}
      {item.bullets.map((bullet) => (
        <View key={bullet.id} style={styles.bullet}>
          <Text style={styles.bulletDot}>•</Text>
          <Text style={styles.bulletText}>{bullet.text}</Text>
        </View>
      ))}
    </View>
  );
}

function SectionContent({ section }: { section: Section }) {
  if (section.type === "summary") {
    return <SummarySection section={section} />;
  }

  if (section.type === "skills") {
    return <SkillsSection section={section} />;
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      {section.items.map((item) => {
        if (section.type === "education") {
          return <EducationItem key={item.id} item={item} />;
        }
        if (section.type === "experience") {
          return <ExperienceItem key={item.id} item={item} />;
        }
        return <DefaultItem key={item.id} item={item} />;
      })}
    </View>
  );
}

interface ResumePdfDocumentProps {
  resume: Resume;
}

export function ResumePdfDocument({ resume }: ResumePdfDocumentProps) {
  const contactItems: string[] = [];
  if (resume.headerData?.email) contactItems.push(resume.headerData.email);
  if (resume.headerData?.phone) contactItems.push(resume.headerData.phone);
  if (resume.headerData?.location) contactItems.push(resume.headerData.location);
  if (resume.headerData?.linkedin) contactItems.push(resume.headerData.linkedin);
  if (resume.headerData?.github) contactItems.push(resume.headerData.github);
  if (resume.headerData?.website) contactItems.push(resume.headerData.website);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.name}>
            {resume.headerData?.name ?? resume.name}
          </Text>
          {contactItems.length > 0 && (
            <View style={styles.contactRow}>
              {contactItems.map((item, i) => (
                <View key={i} style={{ flexDirection: "row" }}>
                  {i > 0 && (
                    <Text style={styles.contactSeparator}> | </Text>
                  )}
                  <Text style={styles.contactItem}>{item}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Sections */}
        {resume.sections.map((section) => (
          <SectionContent key={section.id} section={section} />
        ))}
      </Page>
    </Document>
  );
}
