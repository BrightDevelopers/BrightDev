# SDK - Software Development Kits

BrightSign provides SDKs to simplify BSN.cloud integration. Currently available: **Go (gopurple)**.

---

## Why SDKs?

Working directly with REST APIs requires handling:
- OAuth2 token management and refresh
- Pagination for large datasets
- Error handling and retries
- Type safety and validation
- Network selection and context management

**SDKs handle all of this for you.**

---

## Available SDKs

### [go/](go/) - gopurple (Reference Implementation)

**Status:** Production-ready  
**Language:** Go  
**Repository:** [github.com/BrightDevelopers/gopurple](https://github.com/BrightDevelopers/gopurple)

```go
client, _ := gopurple.New()
client.Authenticate(ctx)
devices, _ := client.Devices.List(ctx, nil)
```

**What it includes:**
- Complete OAuth2 implementation
- Device management APIs
- Content upload/download
- B-Deploy provisioning
- Remote DWS (screenshots, reboots, diagnostics)
- 73 working example programs

**Why Go first?**
- AI assistants write excellent Go code
- Strong typing catches errors at compile time
- Single binary deployment (no dependencies)
- Patterns translate easily to other languages

---

## Using gopurple as a Reference

**Even if you're not writing Go**, gopurple demonstrates the patterns you need:

### Authentication Pattern
```go
// gopurple shows how to:
// 1. Request token
// 2. Handle token expiry
// 3. Auto-refresh when needed

if err := client.Authenticate(ctx); err != nil {
    // Handle auth failure
}
```

**Translate this to Kotlin:**
- Same OAuth2 flow
- Same error handling approach
- Same token refresh logic

### Pagination Pattern
```go
// gopurple shows how to handle large result sets
opts := &ListOptions{Limit: 100}
for {
    devices, err := client.Devices.List(ctx, opts)
    // Process devices...
    if devices.Offset + len(devices.Items) >= devices.Total {
        break
    }
    opts.Offset += len(devices.Items)
}
```

**The pattern works in any language** — gopurple just shows you how.

---

## SDK Roadmap

### Planned SDKs

**Python** - In development
- Asyncio support for concurrent operations
- Type hints throughout
- Similar API to gopurple

**TypeScript/JavaScript** - Planned
- Browser and Node.js support
- Promise-based async operations
- Full type definitions

**Kotlin/JVM** - Community requested
- OkHttp client integration
- Coroutine support
- Idiomatic Kotlin patterns

### Timeline
We prioritize SDKs based on community demand. If you need a specific language:
1. Check [GitHub Discussions](https://github.com/BrightDevelopers/discussions)
2. Upvote existing requests or create a new one
3. Consider contributing! (See below)

---

## Building Your Own SDK

**Want to create an SDK for your language?**

Use **gopurple as your reference implementation**:

1. **Study the patterns** in [gopurple/](https://github.com/BrightDevelopers/gopurple)
2. **Reference the API docs** in [Technical Documentation](https://github.com/BrightDevelopers/technical-documentation)
3. **Ask your AI assistant** to translate gopurple patterns to your language

### What to implement:

**Core (minimum viable):**
- [ ] OAuth2 client credentials authentication
- [ ] Token auto-refresh
- [ ] Device list/get operations
- [ ] Network context management
- [ ] Error handling

**Recommended:**
- [ ] Pagination support
- [ ] Content upload/download
- [ ] B-Deploy APIs
- [ ] Remote DWS operations

**Advanced:**
- [ ] Presentation management
- [ ] WebSocket support for real-time updates
- [ ] Batch operations
- [ ] Retry logic with exponential backoff

---

## Community SDKs

Have you built an SDK in another language? We'd love to feature it here!

**To submit:**
1. Ensure it follows BSN.cloud best practices
2. Include comprehensive examples
3. Open a PR to add it to this README
4. We'll review and link to your repo

---

## Getting Help

**Questions about SDK development?**  
→ [GitHub Discussions](https://github.com/BrightDevelopers/discussions)

**Need API reference?**  
→ [Technical Documentation](https://github.com/BrightDevelopers/technical-documentation)

**Want to see working code?**  
→ [gopurple examples](https://github.com/BrightDevelopers/gopurple/tree/main/examples)

---

[← Back to BrightDev](../README.md)
