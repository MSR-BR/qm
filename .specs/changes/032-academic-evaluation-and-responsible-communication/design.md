# Design

## Academic evaluation

The versioned outcome dictionary separates five families: learning, behavior,
experience, implementation fidelity, and equity/safety. Learning retention uses
delayed unaided retrieval; the transfer indicator uses changed representations.
Analytics and ratings remain explicitly non-learning. The owner API returns only
aggregate counts and a claim-bounded report; it does not return learner rows.

## Responsible communication

Learning email is a separate affirmative preference. Eligibility fails closed
when consent, current legal acknowledgement, time zone, reviewed due activity,
quiet hours, daily cap, rolling cap, or pause fails. The database RPC serializes
reservation per learner with an advisory transaction lock and append-only event.
The fixed English template explains the reason and provides a choice to ignore it.

Unsubscribe tokens are HMAC-signed, bound to the current opt-in timestamp,
length-bounded and validated. The visible management URL keeps the token in the
fragment and asks for confirmation; standards-compatible mail clients receive
RFC `List-Unsubscribe` and `List-Unsubscribe-Post` headers. No token, address or
message body enters the communication-event table.

Provider acceptance is `sent`, not exposure. Confirmed `delivered`, `bounced`
and `acted` evidence requires a future reviewed provider/click integration.

## Release boundary

`QM_LEARNING_EMAIL_DELIVERY_ENABLED` defaults to absent/off and is checked in
addition to the provider API key and a minimum 32-character unsubscribe secret.
No scheduler exists. Migration, environment configuration, sender activation,
webhook setup, scheduled work and deployment are separate authorized actions.
