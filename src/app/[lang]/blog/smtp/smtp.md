Reacher is [open-source](https://github.com/reacherhq/check-if-email-exists), so there's really no secret. But for those less familiar with the technical aspects, I'll explain a bit more here, hopefully in a beginner-friendly way. The secret is called **"SMTP email verification"**.

### How SMTP Email Verification Works

SMTP email verification involves a series of commands to interact with the recipient's mail provider (Outlook, Gmail, Yahoo...).

Let's take a look at a typical conversation between a sender (Reacher) and the provider of the email you want to check. In our case, we want to verify `someone@gmail.com`, the provider being Gmail. Reacher initiates the protocol, called "SMTP", or "Simple Mail Transfer Protocol".

> **Reacher:** Hi there, Gmail! I'm trying to send an email address. Can I connect to your SMTP server?

> **Gmail:** Ah, hello! Please send an **EHLO** command to introduce yourself.

> **Reacher:** Got it! Here it goes: `EHLO reacher.email`.

> **Gmail** _(checks if reacher.email is a valid domain)_: Hello Reacher! Nice to meet you. I've received your EHLO command, your IP reputation seems good. You're now connected to my SMTP server.

> **Reacher:** Great, thanks! Next, I'll send a **MAIL FROM** command to specify the my own email address as the sender. Here it is: `MAIL FROM: <test@reacher.email>`

> **Gmail:** Received! I've got the sender's email address. Now, please go ahead and send the **RCPT TO** command with the recipient's email address.

> **Reacher:** Here it is: `RCPT TO: <someone@gmail.com>`.

> **Gmail:** Okay, I've received the RCPT TO command. Let me check if the recipient's email address is valid... _(pause)_ Ah, yes! The recipient's email address is valid and deliverable.

> **Reacher:** Excellent, bye bye!

> **Gmail:** _(puzzled)_ ...?

It's important to note that Reacher doesn't actually send the email at the end of the conversation, but rather terminates it quickly. This is enough to check if the email is deliverable. If this process is repeated excessively, the email provider may flag Reacher as a spam user. This is where [Proxies](https://docs.reacher.email/self-hosting/proxies) play a crucial role.

### Parsing Responses for Deliverability

Reacher analyzes the responses from the **RCPT TO** command to determine deliverability. This analysis involves checking response codes and messages:

-   **Positive Responses**: Codes like `250 OK` indicate a valid address.
-   **Negative Responses**: Codes like `550` or `553` indicate invalid or non-existent addresses.
-   **Ambiguous Responses**: Temporary errors (e.g., `421` or `450`) suggest issues like rate limits or server unavailability.

Some servers may use catch-all configurations or impose SMTP restrictions, such as requiring authentication or blocking address verification attempts. These behaviors can make the verification process more complicated, but Reacher provides solutions to handle these challenges effectively.

### The Advantages of SMTP Email Verification

1. **Enhanced Deliverability**: With real-time email verification, we can determine if the email is deliverable _right now_. This significantly improves accuracy.
2. **Reduced Bounce Rates**: Fewer bounces protects the sender's reputation and prevent blacklistings, a crucial feature of Reacher.
3. **Scaling Efficiency**: As long as we make sure the verifying party's IP is good (for example using proxies), then we can make a large number of parallel requests.

SMTP email verification offers a methodical approach to ensuring email list hygiene and optimizing communication strategies. By utilizing commands like EHLO/HELO, MAIL FROM, and RCPT TO, **Reacher** facilitates precise and effective address validation.
