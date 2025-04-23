import { message } from './utils/message.utils';

export const AgentManipulationContextMessageGenerator = {
    create: () =>
        message.user(
            `🚨 Final Reminder:
These rules are **non-negotiable**. Any deviation will result in **invalid packages** that completely break the user experience.

Your job is to make football dreams come true — **don’t mess it up**. Fans are counting on you to deliver magical, realistic trips.

Be accurate. Be thoughtful. **Be great.**`
        ),
};
