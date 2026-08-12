import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import type { CSSProperties } from "react";

export interface WaitlistConfirmationEmailProps {
  firstName?: string;
  siteUrl: string;
}

export const WaitlistConfirmationEmail = ({
  firstName,
  siteUrl,
}: WaitlistConfirmationEmailProps) => (
  <Html lang="en">
    <Head />
    <Preview>You are on the Aiyomi waitlist 🌱</Preview>
    <Body style={bodyStyle}>
      <Container style={containerStyle}>
        <Section style={sproutStyle} aria-hidden="true">
          🌱
        </Section>
        <Heading style={headingStyle}>You&apos;re on the list!</Heading>
        <Text style={textStyle}>{firstName ? `Hi ${firstName},` : "Hello,"}</Text>
        <Text style={textStyle}>
          Thanks for joining Aiyomi. We&apos;re creating a cozy AI companion
          to help you plan with care, focus on what matters, and grow in a way
          that fits real life.
        </Text>
        <Section style={messageStyle}>
          <Text style={messageTextStyle}>
            Aiyomi is coming to iOS and Android. We&apos;ll let you know when
            your companion is ready.
          </Text>
        </Section>
        <Button href={siteUrl} style={buttonStyle}>
          Visit Aiyomi
        </Button>
        <Text style={gentleTextStyle}>
          Until then, take things one kind step at a time. Rest counts too.
        </Text>
        <Text style={footerStyle}>
          Aiyomi · Your AI companion for better days.
        </Text>
      </Container>
    </Body>
  </Html>
);

export default WaitlistConfirmationEmail;

const bodyStyle: CSSProperties = {
  backgroundColor: "#fff9ee",
  color: "#26332f",
  fontFamily:
    "Inter, ui-rounded, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  margin: 0,
  padding: "32px 12px",
};

const containerStyle: CSSProperties = {
  backgroundColor: "#ffffff",
  border: "1px solid #eee3d1",
  borderRadius: "24px",
  boxShadow: "0 18px 50px rgba(61, 72, 64, 0.10)",
  margin: "0 auto",
  maxWidth: "560px",
  padding: "38px 34px 28px",
};

const sproutStyle: CSSProperties = {
  backgroundColor: "#e4f4e9",
  borderRadius: "999px",
  fontSize: "28px",
  height: "56px",
  lineHeight: "56px",
  textAlign: "center",
  width: "56px",
};

const headingStyle: CSSProperties = {
  color: "#26332f",
  fontSize: "30px",
  lineHeight: "38px",
  margin: "24px 0 18px",
};

const textStyle: CSSProperties = {
  color: "#4f5f58",
  fontSize: "16px",
  lineHeight: "26px",
  margin: "0 0 16px",
};

const messageStyle: CSSProperties = {
  backgroundColor: "#f4f1ff",
  borderRadius: "18px",
  margin: "24px 0",
  padding: "18px 20px",
};

const messageTextStyle: CSSProperties = {
  color: "#4a465f",
  fontSize: "16px",
  fontWeight: 600,
  lineHeight: "25px",
  margin: 0,
};

const buttonStyle: CSSProperties = {
  backgroundColor: "#397f75",
  borderRadius: "999px",
  color: "#ffffff",
  display: "inline-block",
  fontSize: "16px",
  fontWeight: 700,
  padding: "13px 22px",
  textDecoration: "none",
};

const gentleTextStyle: CSSProperties = {
  color: "#68766f",
  fontSize: "14px",
  lineHeight: "23px",
  margin: "26px 0 0",
};

const footerStyle: CSSProperties = {
  borderTop: "1px solid #eee8dd",
  color: "#78847e",
  fontSize: "12px",
  lineHeight: "20px",
  margin: "28px 0 0",
  paddingTop: "18px",
};
