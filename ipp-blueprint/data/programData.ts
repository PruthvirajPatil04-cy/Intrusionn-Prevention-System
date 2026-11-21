import {
  Control,
  Principle,
  ArchitectureNode,
  LifecycleStage,
  SocUseCase,
  ZeroTrustPillar,
  FrameworkMapping,
  MetricItem,
  ChecklistItem,
  EmergingTopic,
  SummaryRow,
} from './types';

export const PROGRAM_METADATA = {
  name: "Intrusion Prevention Program (IPP) Blueprint",
  version: "2026.4-ENTERPRISE",
  scope: "Global Hybrid Infrastructure",
  updatedAt: "November 2026",
  classification: "Enterprise Defense Architecture",
  author: "Enterprise Security Architecture & SOC Engineering",
};

export const STRATEGIC_OBJECTIVES = [
  {
    id: "OBJ-01",
    title: "Proactive Intrusion Mitigation",
    description: "Prevent known and behaviorally anomalous intrusions before malicious actors can impact critical infrastructure or crown-jewel data stores.",
    kpi: "99.4% Automated Block of Known C2/Exploit Traffic"
  },
  {
    id: "OBJ-02",
    title: "Drastic Attacker Dwell Time Reduction",
    description: "Compress adversary dwell time via inline automated blocking at strategic chokepoints coupled with sub-minute SOC alerting and auto-enrichment.",
    kpi: "< 15 min Mean Time to Detect & Contain"
  },
  {
    id: "OBJ-03",
    title: "Least-Privilege Network Behavior",
    description: "Enforce deterministic protocol constraints and zero-trust microsegmentation so that an initial endpoint foothold cannot pivot to internal assets.",
    kpi: "100% Microsegment Border Inspection"
  },
  {
    id: "OBJ-04",
    title: "Omni-Surface Visibility & Telemetry",
    description: "Deliver unified, high-fidelity intrusion prevention coverage across North-South internet edges, East-West data center fabrics, and cloud VPC/VNet workloads.",
    kpi: "98.2% Total Hybrid Perimeter & Fabric Coverage"
  }
];

export const GUIDING_PRINCIPLES: Principle[] = [
  {
    id: "PRIN-01",
    title: "Defense in Depth with Chokepoint Redundancy",
    description: "No single inspection layer is solely trusted. Host-based HIPS, virtual cloud firewalls, and hardware edge NGFW/IPS form concentric rings of inspection.",
    category: "Architectural"
  },
  {
    id: "PRIN-02",
    title: "Prevention is Vital, but Detection & Forensics are Mandated",
    description: "Blocking is prioritized, but every blocked or anomalous session must retain full packet and session metadata for attribution, hunting, and root-cause analysis.",
    category: "Strategic"
  },
  {
    id: "PRIN-03",
    title: "Identity as the Ultimate Perimeter",
    description: "Network boundaries must be continuously cross-referenced with user credentials, device health, and IdP session risk rather than raw IP addresses alone.",
    category: "Architectural"
  },
  {
    id: "PRIN-04",
    title: "Strict Industry Framework Alignment",
    description: "Every signature, policy set, and sensor placement is systematically mapped to NIST SP 800-94, NIST CSF 2.0, CIS Controls v8 (12-13), and MITRE ATT&CK.",
    category: "Operational"
  }
];

export const GOVERNANCE_ROLES = [
  {
    role: "Network Security Engineering",
    ownership: "Architecture, sensor placement, hardware/virtual capacity, rule tuning, latency SLAs, failover design.",
    keyInteractions: "Coordinates with Infrastructure & Cloud Platform teams for TAP/SPAN and inline routing."
  },
  {
    role: "SOC & Threat Detection Engineering",
    ownership: "Alert triage, SIEM/SOAR correlation, custom signature authorship, threat hunting, false-positive feedback loops.",
    keyInteractions: "Maintains 24/7/365 active incident queue and feeds threat intelligence into blocklists."
  },
  {
    role: "Incident Response (CSIRT)",
    ownership: "Emergency blocking execution, forensic PCAP extraction, attack-chain reconstruction, post-incident prevention reviews.",
    keyInteractions: "Exercises rapid change approval authority during P1 active breach containment."
  },
  {
    role: "GRC & Security Compliance",
    ownership: "Validates policy alignment against NIST SP 800-94, PCI-DSS 4.0 (Req 11.4), ISO 27001 (A.13.1), and SOC 2 Type II.",
    keyInteractions: "Audits exception lifecycles and maintains evidentiary audit logs."
  }
];

export const EXCEPTION_MANAGEMENT_PROCESS = {
  policy: "Zero permanent IPS exclusions. All rule suppressions, IP whitelists, and bypasses must follow the documented exception protocol.",
  maxDuration: "90 calendar days maximum before required re-justification.",
  steps: [
    { step: 1, name: "Formal Request", desc: "System owner files ticket detailing Business Justification, affected CIDR/Port, and CVE/Signature ID." },
    { step: 2, name: "Threat Review", desc: "Detection Engineer assesses compensatory controls (e.g., EDR isolation, strict NAC role, WAF)." },
    { step: 3, name: "Approval Gate", desc: "Requires sign-off from both Network Security Lead and Principal Threat Architect." },
    { step: 4, name: "Time-Bound Deployment", desc: "Rule suppression deployed with automated expiration tag in firewall configuration manager." },
    { step: 5, name: "Decommissioning / Review", desc: "Automated alert triggers 14 days prior to expiry; un-renewed exceptions automatically lapse to block." }
  ]
};

export const ARCHITECTURE_NODES: ArchitectureNode[] = [
  {
    id: "node-perimeter",
    name: "Internet Perimeter (North-South)",
    layer: "perimeter",
    direction: "North-South",
    description: "High-capacity inline inspection integrated behind edge routers and next-generation firewalls at enterprise internet gateways, primary data centers, and regional hubs.",
    chokepoints: [
      "Enterprise WAN Edge / BGP Border Routers",
      "Public DMZ Ingress Load Balancers",
      "Direct Internet Access (DIA) Outbound Proxies"
    ],
    inspectionFocus: [
      "Inbound web application & protocol exploit attempts",
      "Reputation-based blocking of malicious IPs, ASNs, and botnets",
      "Command and Control (C2) callback beacons & DNS tunneling",
      "Unauthorized exfiltration protocols and reverse shell attempts"
    ],
    enforcementMode: "Inline Active Block with Reputation Pre-Filtering",
    telemetryOutput: [
      "Syslog CEF / JSON to SIEM (Splunk/Sentinel)",
      "NetFlow / IPFIX enriched with threat classification",
      "Automatic dynamic threat intel feed sync (MISP / AlienVault)"
    ],
    tuningGuidance: "Apply reputation filtering upfront to drop 70%+ of bulk scans before deep packet inspection engines engage, preserving sensor CPU.",
    kpis: [
      { label: "Inspection Throughput", value: "40 Gbps" },
      { label: "Hardware Latency Penalty", value: "< 25 µs" },
      { label: "Average Daily Blocks", value: "1.4M events" }
    ]
  },
  {
    id: "node-datacenter",
    name: "Data Center & Internal Network (East-West)",
    layer: "datacenter",
    direction: "East-West",
    description: "Fabric-level virtual and hardware sensors positioned between user enclaves, server zones, database clusters, and privileged management networks.",
    chokepoints: [
      "Core Spine-Leaf Aggregation Switches",
      "Inter-VLAN Core Routing Boundaries",
      "Secure Bastion & Jump Host Access Paths"
    ],
    inspectionFocus: [
      "Adversary lateral movement (Pass-the-Hash, SMB/RPC probing)",
      "Internal reconnaissance and network discovery (port scans, AD queries)",
      "Database protocol exploitation (SQLi over TDS/Oracle Net)",
      "East-West malware dissemination (worm-like propagation)"
    ],
    enforcementMode: "Customized Zone-Tailored Inline Prevention",
    telemetryOutput: [
      "Internal flow anomalies to UEBA/SOC",
      "Kerberos and NTLM session security telemetry",
      "Database audit log correlation triggers"
    ],
    tuningGuidance: "Do not mirror perimeter rules; deploy tailored profiles stripped of public web signatures and focused heavily on SMB, RPC, SSH, and RDP anomaly detection.",
    kpis: [
      { label: "East-West Fabric Coverage", value: "96.5%" },
      { label: "False Positive Ratio", value: "0.012%" },
      { label: "Internal Zones Protected", value: "18 Clusters" }
    ]
  },
  {
    id: "node-cloud",
    name: "Cloud & Hybrid Workloads",
    layer: "cloud",
    direction: "Hybrid",
    description: "Virtual appliance clusters and cloud-native network firewall/IPS deployed across AWS Transit Gateways, Azure Virtual WAN hubs, and GCP Shared VPCs.",
    chokepoints: [
      "Centralized Cloud Egress Transit Gateways",
      "Direct Connect / ExpressRoute hybrid interconnects",
      "Cross-VPC / Peering boundary enforcement routers"
    ],
    inspectionFocus: [
      "Cloud metadata service (169.254.169.254) SSRF and credential theft",
      "Serverless and container orchestration API vulnerabilities (K8s API)",
      "Misconfigured IAM/Security Group reconnaissance",
      "Direct-to-internet outbound data staging and egress leaks"
    ],
    enforcementMode: "Autoscaling Cloud-Native Inline IPS",
    telemetryOutput: [
      "CloudTrail / Azure Monitor / VPC Flow Logs fusion",
      "Container runtime network alerts to SOC",
      "Infrastructure-as-Code Terraform policy drift hooks"
    ],
    tuningGuidance: "Leverage cloud-init autoscaling to dynamically match sensor capacity with workload elasticity; enforce strict egress filtering on IAM role tokens.",
    kpis: [
      { label: "VPC/VNet Enclaves Inspected", value: "42 Accounts" },
      { label: "Scale-Out Latency", value: "< 90 sec" },
      { label: "Cloud Egress Inspection", value: "100%" }
    ]
  },
  {
    id: "node-segmentation",
    name: "Network Segmentation & 802.1X / NAC",
    layer: "segmentation",
    direction: "Boundary",
    description: "Policy-defined zoning combining dynamic Network Access Control (802.1X), microsegmentation firewalls, and cryptographic trust boundaries.",
    chokepoints: [
      "Campus LAN Access Switches & Wireless Controllers",
      "Zero Trust Network Access (ZTNA) Cloud Proxies",
      "OT / IoT Industrial Network Segregation Gateways"
    ],
    inspectionFocus: [
      "Unauthorized device rogue attachment and MAC spoofing",
      "Cross-zone unauthorized protocol traversal",
      "BYOD and guest network hopping attempts",
      "OT protocol tampering (Modbus, BACnet, DNP3 unauthorized function codes)"
    ],
    enforcementMode: "Identity-Gated Microsegmentation & Quarantine",
    telemetryOutput: [
      "Radius / TACACS+ authentication logs to SOC",
      "Dynamic VLAN reassignment telemetry",
      "Quarantine state notifications to EDR"
    ],
    tuningGuidance: "Pair NAC posture checks with inline sensors to automatically shove compromised devices into isolated remediation VLANs without human delay.",
    kpis: [
      { label: "Endpoints Under 802.1X/NAC", value: "14,800+" },
      { label: "Quarantine Action Time", value: "< 2 sec" },
      { label: "Microsegment Compliance", value: "98.9%" }
    ]
  },
  {
    id: "node-endpoint",
    name: "Endpoint / HIPS & EDR Complement",
    layer: "endpoint",
    direction: "Host",
    description: "Host-Based Intrusion Prevention System (HIPS) and Extended Detection & Response (EDR) agents installed across crown-jewel servers, developer workstations, and edge nodes.",
    chokepoints: [
      "Host Kernel Network Drivers & WFP (Windows Filtering Platform)",
      "Linux eBPF Socket Filters & Netfilter",
      "Container Daemon Runtime Socket Boundaries"
    ],
    inspectionFocus: [
      "Exploits executed over encrypted loopback or intra-host sockets",
      "Memory injection, LSASS dumping, and token impersonation",
      "Fileless living-off-the-land binaries (LOLBins) network connections",
      "Immediate host-level process termination and network isolation"
    ],
    enforcementMode: "Host-Level Kernel Blocking & Network Isolation",
    telemetryOutput: [
      "Endpoint process tree and socket binding telemetry",
      "File integrity and memory mutation telemetry",
      "Bi-directional correlation keys to Network IPS"
    ],
    tuningGuidance: "Ensure EDR and Network IPS share common alert taxonomy (e.g., matching ATT&CK IDs) so the SOC can instantly link network alerts with host process trees.",
    kpis: [
      { label: "Host Agent Coverage", value: "99.1%" },
      { label: "Local Process Isolation", value: "Immediate" },
      { label: "Correlated Incidents", value: "88% linked" }
    ]
  }
];

export const LIFECYCLE_STAGES: LifecycleStage[] = [
  {
    id: "stage-scope",
    step: 1,
    name: "Scope",
    tagline: "Define protected domains, latency tolerances, and operational boundaries.",
    objectives: [
      "Inventory all in-scope CIDR blocks, VPCs, and egress points.",
      "Categorize assets by business criticality (Tier 0 Identity/Core, Tier 1 App, Tier 2 Corporate).",
      "Establish inspection latency SLAs per application tier (e.g., < 1ms for trading, < 10ms for web)."
    ],
    actions: [
      "Document architectural enforcement boundaries and TAP/inline tap topologies.",
      "Review encrypted traffic policies and identify mandatory TLS decryption zones.",
      "Publish change window and emergency bypass procedures for network operations."
    ],
    tuningNotes: [
      "Engage application owners upfront to understand custom high-throughput batch protocols.",
      "Map out legacy hardware that cannot support inline deep packet inspection."
    ],
    alertFirstGuidance: "Set sensor global mode to passive TAP/SPAN mode or Inline-Bypass during initial deployment to benchmark hardware and buffer headroom.",
    exitCriteria: [
      "Architectural boundary blueprint approved by Network Architecture & GRC.",
      "Asset criticality tiers and latency tolerances signed off by service owners."
    ]
  },
  {
    id: "stage-discover",
    step: 2,
    name: "Discover",
    tagline: "Build a deep baseline of normal application flows, protocols, and traffic distributions.",
    objectives: [
      "Conduct automated passive flow and protocol analysis across all sensor interfaces.",
      "Fingerprint operating systems, services, software versions, and common payload schemas.",
      "Identify non-standard port utilization and unmanaged shadow IT applications."
    ],
    actions: [
      "Deploy sensors in passive listening mode for a minimum 14-day observation cycle.",
      "Populate network asset variables (HOME_NET, EXTERNAL_NET, HTTP_SERVERS, SQL_SERVERS).",
      "Generate top-talker reports and analyze packet size and throughput variance."
    ],
    tuningNotes: [
      "Calibrate variable sets accurately; failing to define SQL_SERVERS will cause false positives across corporate user subnets.",
      "Isolate internal vulnerability scanners (Nessus, Qualys) into dedicated scanner exceptions."
    ],
    alertFirstGuidance: "Review top 20 noisest signatures; in discovery mode, 90% of noise stems from benign internal tools with unusual header structures.",
    exitCriteria: [
      "Network variable sets validated with active configuration.",
      "Flow baseline documented with 14-day minimum continuous telemetry."
    ]
  },
  {
    id: "stage-protect",
    step: 3,
    name: "Protect",
    tagline: "Deploy tiered enforcement: reputation filtering → high-confidence block → malware analysis.",
    objectives: [
      "Transition from passive discovery to staged inline active enforcement.",
      "Activate IP and domain reputation filtering to reject malicious traffic early.",
      "Enable high-confidence, low-false-positive exploit signatures in blocking mode."
    ],
    actions: [
      "Activate hardware bypass switches to guarantee link availability during power loss.",
      "Enable CVE signatures with CVSS score >= 9.0 and known in-the-wild exploitation.",
      "Configure automated file analysis / sandbox detonation for inline executable downloads."
    ],
    tuningNotes: [
      "Never flip an entire rule category to block overnight; promote signatures in disciplined batches.",
      "Ensure DNS sinkholing is configured for known C2 domains to facilitate endpoint infection triage."
    ],
    alertFirstGuidance: "Every rule must run in 'Alert Mode' for at least 7 days with zero production incident false positives before being toggled to 'Inline Block'.",
    exitCriteria: [
      "Tier 1 high-confidence signatures operating in blocking mode without customer impact.",
      "Reputation blocking operational at all external perimeters."
    ]
  },
  {
    id: "stage-optimize",
    step: 4,
    name: "Optimize",
    tagline: "Tune noise, integrate threat intelligence, and align coverage with MITRE ATT&CK.",
    objectives: [
      "Systematically reduce false positives to < 0.05% of generated alerts.",
      "Ingest commercial and ISAC threat intelligence feeds into automated blocklists.",
      "Prioritize custom detection rules for MITRE ATT&CK techniques observed in target industry."
    ],
    actions: [
      "Conduct weekly signature tuning triage with SOC detection engineers.",
      "Establish segment-specific inspection profiles (e.g., restrict database exploit rules strictly to DB zone).",
      "Deploy purple-team automated attack simulations (e.g., Caldera/Atomic Red Team) to test efficacy."
    ],
    tuningNotes: [
      "Disable signatures for software stacks not present in the enterprise to save sensor CPU.",
      "Implement threshold-based rate limiting for high-volume protocol anomalies (e.g., SYN/ICMP floods)."
    ],
    alertFirstGuidance: "Promote alert-mode signatures to block only after verifying: 1) Verified zero false positives, 2) Signed off by SOC lead, 3) Documented rollback ticket.",
    exitCriteria: [
      "False positive rate sustained below 0.05% for 30 consecutive days.",
      "MITRE ATT&CK priority techniques validated via purple-team testing."
    ]
  },
  {
    id: "stage-maintain",
    step: 5,
    name: "Maintain",
    tagline: "Sustain engine currency, hardware health, automated updates, and policy versioning.",
    objectives: [
      "Maintain engine, signature, and firmware updates on strict SLAs.",
      "Continuously monitor sensor CPU, RAM, packet drops, and inspection latency.",
      "Version-control all IPS configuration and rule files within an Infrastructure-as-Code pipeline."
    ],
    actions: [
      "Execute signature update ingestion within 2 hours of vendor release for critical zero-days.",
      "Schedule quarterly capacity forecasting against corporate bandwidth growth trends.",
      "Conduct annual configuration baseline audits and purge all expired rule exceptions."
    ],
    tuningNotes: [
      "Maintain a canary sensor in a pre-production testing network to validate signature updates before enterprise-wide push.",
      "Store all rule modifications in Git with peer review and automated syntax linting."
    ],
    alertFirstGuidance: "If a new vendor signature update generates sudden alert spikes, immediately revert that specific rule to Alert Mode while investigating upstream vendor issues.",
    exitCriteria: [
      "Signature update SLA verified < 2 hours for emergency out-of-band updates.",
      "All active rules under Git version control with verified audit histories."
    ]
  }
];

export const SOC_USE_CASES: SocUseCase[] = [
  {
    id: "UC-01",
    name: "Credential Stuffing & Boundary Breach",
    severity: "Critical",
    trigger: "Network IPS flags external brute-force or credential stuffing signature on perimeter gateway.",
    correlationLogic: "Correlate with IdP logs (Okta/Entra ID) showing concurrent anomalous sign-in success from same external subnet within 5 minutes.",
    soarAction: "Revoke active Okta session, trigger immediate MFA re-challenge, and deploy perimeter IP temporary blocklist via firewall API.",
    containmentProtocol: "Account disabled in Active Directory, workstation isolated by EDR, ticket routed to Tier 2 SOC queue.",
    evidenceRetained: [
      "Full PCAP snippet of brute-force packet sequence",
      "IdP geolocation and device context metadata",
      "Firewall session table snapshot"
    ]
  },
  {
    id: "UC-02",
    name: "C2 Callback & Active Host Compromise",
    severity: "Critical",
    trigger: "Inline IPS blocks outbound beaconing to known Cobalt Strike / Sliver C2 infrastructure.",
    correlationLogic: "Correlate blocked network IP with endpoint EDR telemetry to identify the parent process and binary establishing the socket.",
    soarAction: "Initiate EDR host network quarantine, capture volatile memory dump, and query threat intel database for binary hash reputation.",
    containmentProtocol: "Host completely isolated from network except for EDR communication; CSIRT initiates P1 containment playbook.",
    evidenceRetained: [
      "Raw payload showing C2 beacon structure and TLS SNI",
      "Endpoint process tree and loaded DLL list",
      "NetFlow records for preceding 48 hours for lateral spread analysis"
    ]
  },
  {
    id: "UC-03",
    name: "East-West Lateral Movement & Kerberoasting",
    severity: "High",
    trigger: "Internal Data Center IPS detects anomalous SPN querying and ticket extraction pattern over Kerberos port 88.",
    correlationLogic: "Match internal source IP with asset database to determine if workstation or server; check if user has active privileged session.",
    soarAction: "Tag user account with High Risk flag in SIEM; alert on any subsequent SMB or RDP connections from source host.",
    containmentProtocol: "Force password reset for targeted service accounts; restrict source host switch port to isolation VLAN.",
    evidenceRetained: [
      "Kerberos TGS request packet capture",
      "Domain Controller Event IDs 4769 and 4771",
      "Switch port MAC/IP address binding log"
    ]
  },
  {
    id: "UC-04",
    name: "Web Application SQLi & Exfiltration",
    severity: "High",
    trigger: "Perimeter IPS detects and blocks SQL Injection payload matching UNION SELECT pattern on public web portal.",
    correlationLogic: "Correlate with WAF alert and backend database access log to verify whether any query reached the database layer.",
    soarAction: "Query Cloudflare/WAF to verify block consistency; append attacking IP to global threat intelligence block list.",
    containmentProtocol: "Verify database transaction logs for data leakage; notify web development squad with exact payload parameters.",
    evidenceRetained: [
      "HTTP request headers, query string, and payload body",
      "Web server access log entries",
      "Backend database audit log query traces"
    ]
  }
];

export const ZERO_TRUST_PILLARS: ZeroTrustPillar[] = [
  {
    id: "ZT-01",
    title: "Identity-Aware Enforcement (Beyond IP)",
    description: "Network security rules are bound dynamically to validated user and device identities rather than transient, easily spoofed IP addresses.",
    technicalMechanism: "Integration with Enterprise Identity Providers (Okta/Entra ID) and ZTNA brokers. IPS sensors query user-ID to IP mapping agents in real time.",
    ipsIntegration: "Rule triggers tag user email and device serial into alert metadata; allows instant user-scoped policies and conditional block lists.",
    metric: "99.4% of internal network events enriched with authenticated user identity"
  },
  {
    id: "ZT-02",
    title: "Microsegmentation & Boundary Chokepoints",
    description: "Deconstruct the network into fine-grained security zones where workloads within the same subnet cannot communicate without inspection.",
    technicalMechanism: "Distributed virtual firewalls and kernel-level eBPF packet filters running at hypervisor/container interfaces.",
    ipsIntegration: "Inline sensors evaluate traffic across microsegment borders, terminating any cross-tier policy violation instantly.",
    metric: "100% of PCI and Crown Jewel database clusters enclosed in isolated microsegments"
  },
  {
    id: "ZT-03",
    title: "Continuous Verification & Session Monitoring",
    description: "Trust is never granted permanently. Every active TCP/UDP session is evaluated continuously for behavioral deviations and threat indicators.",
    technicalMechanism: "Behavioral anomaly detection engines tracking packet timing, volume deviation, and protocol compliance across established connections.",
    ipsIntegration: "Sessions that suddenly switch from benign database queries to bulk data dumping are terminated mid-stream, even post-authentication.",
    metric: "< 100 ms automated session termination upon anomaly confirmation"
  },
  {
    id: "ZT-04",
    title: "Zero Implicit Trust & Default-Deny Boundaries",
    description: "All inbound, outbound, and inter-zone communication is denied by default; only explicitly authorized protocol handshakes are inspected and allowed.",
    technicalMechanism: "Strict layer 7 application whitelisting and egress gateway enforcement preventing arbitrary outbound connections.",
    ipsIntegration: "Any protocol running over non-standard ports (e.g., SSH over port 443 or DNS over port 80) is flagged as an evasion attempt and blocked.",
    metric: "0 unauthorized boundary ports permitted across all corporate enclaves"
  }
];

export const FRAMEWORK_MAPPINGS: FrameworkMapping[] = [
  {
    id: "FW-01",
    framework: "NIST SP 800-94",
    controlRef: "Sec 3.2 - 3.4",
    frameworkTitle: "IDPS Architectural Planning & Sensor Placement",
    ippCoverage: "Defines North-South edge inline, East-West data center fabric, and cloud VPC sensor topologies with failover bypass design.",
    coverageLevel: "Full",
    primaryIppControls: ["IPP-ARC-01", "IPP-ARC-02", "IPP-ARC-03"]
  },
  {
    id: "FW-02",
    framework: "NIST SP 800-94",
    controlRef: "Sec 4.2 - 4.4",
    frameworkTitle: "IDPS Tuning, Signature Management & Operational Maintenance",
    ippCoverage: "Implements formal 5-stage lifecycle (Scope-Discover-Protect-Optimize-Maintain) with alert-first tuning and vendor update SLAs.",
    coverageLevel: "Full",
    primaryIppControls: ["IPP-LFC-01", "IPP-LFC-02", "IPP-LFC-03"]
  },
  {
    id: "FW-03",
    framework: "NIST CSF 2.0",
    controlRef: "PR.IR-01",
    frameworkTitle: "Networks & Environments are Protected from Unauthorized Access",
    ippCoverage: "Inline IPS deployed at perimeter and internal boundaries enforcing default-deny unauthorized protocol access.",
    coverageLevel: "Full",
    primaryIppControls: ["IPP-GOV-01", "IPP-ARC-01", "IPP-ZT-01"]
  },
  {
    id: "FW-04",
    framework: "NIST CSF 2.0",
    controlRef: "DE.CM-01",
    frameworkTitle: "Networks and Environments are Monitored for Anomalies & Threats",
    ippCoverage: "Real-time deep packet inspection and signature/anomaly engines feeding high-fidelity telemetry to SIEM/SOAR.",
    coverageLevel: "Full",
    primaryIppControls: ["IPP-SOC-01", "IPP-MET-01"]
  },
  {
    id: "FW-05",
    framework: "NIST CSF 2.0",
    controlRef: "RS.CO-02",
    frameworkTitle: "Incidents are Reported and Coordinated with Stakeholders",
    ippCoverage: "Automated SOAR playbooks generate tickets, enrich threat intelligence, and page on-call CSIRT responders during high-severity blocks.",
    coverageLevel: "High",
    primaryIppControls: ["IPP-SOC-02", "IPP-SOC-03"]
  },
  {
    id: "FW-06",
    framework: "CIS Controls v8",
    controlRef: "Control 12.2",
    frameworkTitle: "Ensure Network Architecture Addresses Segmentation",
    ippCoverage: "Microsegmentation architecture with inline IPS monitoring and enforcing boundaries between DMZ, Corporate, and Database zones.",
    coverageLevel: "Full",
    primaryIppControls: ["IPP-ARC-04", "IPP-ZT-02"]
  },
  {
    id: "FW-07",
    framework: "CIS Controls v8",
    controlRef: "Control 13.3",
    frameworkTitle: "Deploy a Network Intrusion Prevention Solution",
    ippCoverage: "Centrally managed enterprise Network IPS deployed inline across all internet gateways, remote offices, and data center cores.",
    coverageLevel: "Full",
    primaryIppControls: ["IPP-ARC-01", "IPP-LFC-03", "IPP-MET-02"]
  },
  {
    id: "FW-08",
    framework: "CIS Controls v8",
    controlRef: "Control 13.8",
    frameworkTitle: "Deploy Network-Based Intrusion Detection for East-West Traffic",
    ippCoverage: "Tailored East-West sensors between user and server enclaves monitoring for internal lateral movement and reconnaissance.",
    coverageLevel: "Full",
    primaryIppControls: ["IPP-ARC-02", "IPP-ZT-02"]
  },
  {
    id: "FW-09",
    framework: "MITRE ATT&CK",
    controlRef: "T1190",
    frameworkTitle: "Exploit Public-Facing Application",
    ippCoverage: "Signature and anomaly inspection on perimeter ingress HTTP/HTTPS, SQL, RPC, and mail protocols dropping exploit attempts.",
    coverageLevel: "High",
    primaryIppControls: ["IPP-ARC-01", "IPP-LFC-03"]
  },
  {
    id: "FW-10",
    framework: "MITRE ATT&CK",
    controlRef: "T1071",
    frameworkTitle: "Application Layer Protocol (Command & Control)",
    ippCoverage: "Detects and terminates C2 beaconing over HTTP, HTTPS (via decryption/ETA), and DNS tunneling channels.",
    coverageLevel: "High",
    primaryIppControls: ["IPP-ARC-01", "IPP-SOC-02", "IPP-EMG-01"]
  },
  {
    id: "FW-11",
    framework: "MITRE ATT&CK",
    controlRef: "T1046",
    frameworkTitle: "Network Service Discovery",
    ippCoverage: "Threshold-based port scanning and horizontal sweep detection automatically quarantines offending internal hosts.",
    coverageLevel: "Full",
    primaryIppControls: ["IPP-ARC-02", "IPP-LFC-04"]
  },
  {
    id: "FW-12",
    framework: "MITRE ATT&CK",
    controlRef: "T1021",
    frameworkTitle: "Remote Services (SMB/Windows Admin Shares)",
    ippCoverage: "Enforces strict protocol conformance on SMB/RPC traffic; blocks unauthorized lateral pass-the-hash and PsExec execution.",
    coverageLevel: "Full",
    primaryIppControls: ["IPP-ARC-02", "IPP-SOC-03"]
  }
];

export const CONTROLS: Control[] = [
  {
    id: "IPP-GOV-01",
    title: "Authorized Traffic Baseline & Default-Deny Boundary",
    description: "Enforce a documented, authorized traffic baseline across all network boundaries, denying unauthorized ports, protocols, and IP ranges by default.",
    section: "Governance & Policy",
    sectionId: "program",
    priority: "P1",
    frameworkRefs: [
      { framework: "NIST CSF 2.0", controlId: "PR.IR-01", title: "Network Protection" },
      { framework: "CIS Controls v8", controlId: "12.1", title: "Ensure Up-to-Date Network Architecture" }
    ],
    implementationNotes: "Boundary routers and firewalls must have default-deny clean-up rules; all permitted flows require ticketed justification.",
    verificationMethod: "Automated configuration audit verifying zero allow-any-any rules across perimeter firewalls."
  },
  {
    id: "IPP-GOV-02",
    title: "Risk-Based Alert-to-Block Promotion Policy",
    description: "Establish formal criteria defining when signatures transition from passive Alert mode to active Inline Block mode based on confidence and blast radius.",
    section: "Governance & Policy",
    sectionId: "program",
    priority: "P1",
    frameworkRefs: [
      { framework: "NIST SP 800-94", controlId: "Sec 4.2", title: "IDPS Tuning" },
      { framework: "NIST CSF 2.0", controlId: "PR.PS-01", title: "Protective Technology" }
    ],
    implementationNotes: "High-confidence exploit signatures with CVSS >= 9.0 may be fast-tracked; application-layer anomaly signatures require 7-day observation.",
    verificationMethod: "Review quarterly tuning logs verifying compliance with the 7-day observation window before block activation."
  },
  {
    id: "IPP-GOV-03",
    title: "Time-Bound Exception Lifecycle & Mandatory Expiry",
    description: "Mandate that all rule suppressions, IP whitelists, and bypasses expire within 90 days and require dual-signoff from Network Security and Threat Architecture.",
    section: "Governance & Policy",
    sectionId: "program",
    priority: "P2",
    frameworkRefs: [
      { framework: "CIS Controls v8", controlId: "12.2", title: "Manage Access Control Lists" }
    ],
    implementationNotes: "Store exception metadata in firewall tag comments with expiry date; automated daily script flags overdue exceptions.",
    verificationMethod: "Execute automated script checking firewall rulebase for tags exceeding 90 days without re-approval."
  },
  {
    id: "IPP-ARC-01",
    title: "Inline Perimeter North-South Inspection",
    description: "Deploy high-throughput inline IPS sensors behind edge firewalls inspecting all internet ingress and egress across HQ, data centers, and branch hubs.",
    section: "Architecture & Placement",
    sectionId: "architecture",
    priority: "P1",
    frameworkRefs: [
      { framework: "NIST SP 800-94", controlId: "Sec 3.2", title: "Network-Based IDPS" },
      { framework: "CIS Controls v8", controlId: "13.3", title: "Deploy Network IPS" },
      { framework: "MITRE ATT&CK", controlId: "T1190", title: "Exploit Public-Facing App" }
    ],
    implementationNotes: "Pair inline sensors with optical bypass switches to maintain network availability in case of sensor hardware failure.",
    verificationMethod: "Inspect BGP/routing configurations ensuring all egress/ingress traffic physically traverses the IPS cluster."
  },
  {
    id: "IPP-ARC-02",
    title: "Tailored East-West Data Center Fabric Inspection",
    description: "Position internal sensors at data center aggregation boundaries to inspect lateral traffic between user, server, management, and database zones.",
    section: "Architecture & Placement",
    sectionId: "architecture",
    priority: "P1",
    frameworkRefs: [
      { framework: "NIST SP 800-94", controlId: "Sec 3.3", title: "Internal Sensor Placement" },
      { framework: "CIS Controls v8", controlId: "13.8", title: "East-West NIDS" },
      { framework: "MITRE ATT&CK", controlId: "T1021", title: "Remote Services" }
    ],
    implementationNotes: "Strip perimeter web application attack signatures; focus CPU on SMB, Kerberos, RPC, database protocols, and internal port sweeps.",
    verificationMethod: "Conduct internal penetration test attempting lateral PsExec/SMB exploitation between segmented zones."
  },
  {
    id: "IPP-ARC-03",
    title: "Cloud-Native Virtual IPS & Transit Gateway Inspection",
    description: "Deploy scalable virtual IPS appliances within cloud hubs (AWS TGW, Azure vWAN, GCP Shared VPC) inspecting cross-VPC and cloud-to-on-prem traffic.",
    section: "Architecture & Placement",
    sectionId: "architecture",
    priority: "P1",
    frameworkRefs: [
      { framework: "NIST CSF 2.0", controlId: "PR.IR-01", title: "Infrastructure Protection" },
      { framework: "MITRE ATT&CK", controlId: "T1078.004", title: "Cloud Accounts" }
    ],
    implementationNotes: "Leverage cloud provider auto-scaling groups and gateway load balancers to scale inspection elastically with traffic spikes.",
    verificationMethod: "Verify cloud route tables route 0.0.0.0/0 and cross-VPC CIDR traffic through the inspection appliance interface."
  },
  {
    id: "IPP-ARC-04",
    title: "Dynamic Network Access Control (802.1X / NAC)",
    description: "Enforce port-based network authentication (802.1X) across all wired and wireless access switches to validate device identity and health posture.",
    section: "Architecture & Placement",
    sectionId: "architecture",
    priority: "P2",
    frameworkRefs: [
      { framework: "CIS Controls v8", controlId: "12.2", title: "Architecture Segmentation" },
      { framework: "NIST SP 800-94", controlId: "Sec 5.1", title: "Host/Network Integration" }
    ],
    implementationNotes: "Integrate with PKI for certificate-based EAP-TLS authentication; non-compliant devices are assigned to a quarantine VLAN.",
    verificationMethod: "Attempt connecting an unmanaged rogue laptop to an internal physical Ethernet port; verify immediate port shut or quarantine."
  },
  {
    id: "IPP-ARC-05",
    title: "Host-Based IPS (HIPS) & EDR Correlation",
    description: "Install host-based intrusion prevention and EDR agents on all Tier 0/1 servers to correlate host-level process telemetry with network IPS alerts.",
    section: "Architecture & Placement",
    sectionId: "architecture",
    priority: "P2",
    frameworkRefs: [
      { framework: "NIST SP 800-94", controlId: "Sec 5.2", title: "Host-Based IDPS" },
      { framework: "CIS Controls v8", controlId: "10.1", title: "Deploy Anti-Malware" }
    ],
    implementationNotes: "Configure common incident tracking keys in SIEM linking network IPS attack alerts with EDR process execution trees.",
    verificationMethod: "Trigger benign test alert (EICAR over HTTP); verify both network IPS alert and host agent detection align in SIEM."
  },
  {
    id: "IPP-LFC-01",
    title: "Automated Network Asset & Flow Discovery",
    description: "Run passive network flow analysis and protocol discovery for a minimum of 14 days before active enforcement to profile systems and traffic volume.",
    section: "Deployment Lifecycle",
    sectionId: "lifecycle",
    priority: "P1",
    frameworkRefs: [
      { framework: "NIST SP 800-94", controlId: "Sec 4.1", title: "IDPS Deployment" },
      { framework: "CIS Controls v8", controlId: "12.3", title: "Automate Network Inventory" }
    ],
    implementationNotes: "Populate local variable sets (HOME_NET, HTTP_SERVERS) based on discovered asset inventory to prevent broad false-positive alerts.",
    verificationMethod: "Compare discovered network asset inventory against Enterprise CMDB to identify coverage gaps."
  },
  {
    id: "IPP-LFC-02",
    title: "Layered Defense Inspection Pipeline",
    description: "Structure sensor inspection pipelines sequentially: Reputation Filtering → Protocol Anomaly Detection → Signature Matching → Sandbox Detonation.",
    section: "Deployment Lifecycle",
    sectionId: "lifecycle",
    priority: "P1",
    frameworkRefs: [
      { framework: "NIST SP 800-94", controlId: "Sec 3.4", title: "IDPS Processing" },
      { framework: "NIST CSF 2.0", controlId: "PR.PS-01", title: "Protective Technology" }
    ],
    implementationNotes: "Drop known bad IP/domain traffic at the edge before invoking compute-heavy deep packet regex evaluation.",
    verificationMethod: "Benchmark sensor CPU utilization during simulated DDoS attack with and without reputation pre-filtering enabled."
  },
  {
    id: "IPP-LFC-03",
    title: "Disciplined 7-Day Alert-First Promotion Cadence",
    description: "All new threat detection rules must operate in passive Alert Mode for 7 consecutive days with zero false positives before promotion to Inline Block.",
    section: "Deployment Lifecycle",
    sectionId: "lifecycle",
    priority: "P2",
    frameworkRefs: [
      { framework: "NIST SP 800-94", controlId: "Sec 4.2", title: "Signature Tuning" }
    ],
    implementationNotes: "Detection Engineering tracks alert volume in staging dashboard; signatures exceeding 5 daily alerts must be investigated and tuned.",
    verificationMethod: "Inspect change management tickets for rule promotions verifying mandatory 7-day observation log attachment."
  },
  {
    id: "IPP-LFC-04",
    title: "Continuous Rule Tuning & False Positive Suppression",
    description: "Conduct bi-weekly rule tuning cycles to suppress noisy, low-efficacy signatures and sustain false-positive rates strictly below 0.05%.",
    section: "Deployment Lifecycle",
    sectionId: "lifecycle",
    priority: "P2",
    frameworkRefs: [
      { framework: "NIST SP 800-94", controlId: "Sec 4.3", title: "Rulebase Maintenance" },
      { framework: "CIS Controls v8", controlId: "13.6", title: "Tune Intrusion Detection" }
    ],
    implementationNotes: "Deactivate vendor signatures covering operating systems or software stacks not present in the corporate environment.",
    verificationMethod: "Audit top 20 noisest signatures in SIEM over 30 days and verify tuning tickets are opened."
  },
  {
    id: "IPP-LFC-05",
    title: "Rapid Out-of-Band Signature Update SLA",
    description: "Establish automated signature update ingestion capable of deploying critical out-of-band threat updates within 2 hours of vendor release.",
    section: "Deployment Lifecycle",
    sectionId: "lifecycle",
    priority: "P1",
    frameworkRefs: [
      { framework: "NIST SP 800-94", controlId: "Sec 4.4", title: "Updates and Upgrades" },
      { framework: "CIS Controls v8", controlId: "13.4", title: "Update Intrusion Detection" }
    ],
    implementationNotes: "Validate updates on a canary sensor in pre-production before automated push to production inline clusters.",
    verificationMethod: "Simulate zero-day feed update; measure elapsed time from vendor notification to active deployment across sensors."
  },
  {
    id: "IPP-SOC-01",
    title: "Normalized SIEM/SOAR Telemetry Pipeline",
    description: "Stream all IPS detection, block, and policy-change events in real time to SIEM/SOAR in normalized Common Event Format (CEF) or ECS JSON.",
    section: "SOC & Incident Response",
    sectionId: "soc",
    priority: "P1",
    frameworkRefs: [
      { framework: "NIST CSF 2.0", controlId: "DE.CM-01", title: "Continuous Monitoring" },
      { framework: "CIS Controls v8", controlId: "13.1", title: "Centralize Security Logs" }
    ],
    implementationNotes: "Include source IP, destination IP, user identity, signature ID, CVE, raw payload snippet, and action taken (Blocked/Alerted).",
    verificationMethod: "Trigger benign network test packet; verify alert arrives in SIEM dashboard with all normalized fields within 15 seconds."
  },
  {
    id: "IPP-SOC-02",
    title: "Automated SOAR Threat Intel Enrichment & Triage",
    description: "Configure SOAR playbooks to automatically enrich high-severity IPS alerts with threat intelligence, asset criticality, and historical incident data.",
    section: "SOC & Incident Response",
    sectionId: "soc",
    priority: "P2",
    frameworkRefs: [
      { framework: "NIST CSF 2.0", controlId: "RS.AN-03", title: "Analysis & Triage" }
    ],
    implementationNotes: "Automate creation of P1/P2 Jira incident tickets for blocks matching known C2 or lateral movement patterns.",
    verificationMethod: "Inspect SOAR execution logs for past 100 alerts; verify automated enrichment was completed on 100% of tickets."
  },
  {
    id: "IPP-SOC-03",
    title: "Emergency Inline Quarantine Playbook",
    description: "Provide CSIRT with pre-approved emergency inline blocking playbooks to quarantine malicious external IP addresses or internal subnets within 5 minutes.",
    section: "SOC & Incident Response",
    sectionId: "soc",
    priority: "P1",
    frameworkRefs: [
      { framework: "NIST CSF 2.0", controlId: "RS.MI-01", title: "Incidents are Contained" }
    ],
    implementationNotes: "API-driven firewall blocklist push with 24-hour default expiration; post-action change ticket filed automatically.",
    verificationMethod: "Conduct tabletop exercise where on-call analyst executes emergency blocking API against test sandbox firewall."
  },
  {
    id: "IPP-SOC-04",
    title: "Full Packet / Session Forensic Evidence Retention",
    description: "Retain raw packet captures and full session connection logs for all blocked and alerted network events for a minimum of 90 days.",
    section: "SOC & Incident Response",
    sectionId: "soc",
    priority: "P2",
    frameworkRefs: [
      { framework: "NIST SP 800-94", controlId: "Sec 6.1", title: "Forensic Readiness" },
      { framework: "CIS Controls v8", controlId: "13.2", title: "Collect Network Traffic Logs" }
    ],
    implementationNotes: "Store ring-buffer PCAP files in encrypted S3/blob storage with strict immutable write-once (WORM) retention policies.",
    verificationMethod: "Perform random audit requesting full PCAP reconstruction for a randomly selected alert from 60 days prior."
  },
  {
    id: "IPP-ZT-01",
    title: "Identity-Aware Dynamic Policy Mapping",
    description: "Integrate network IPS enforcement engines with Enterprise Identity Providers (IdP) to bind network security decisions to user and device identity.",
    section: "Zero Trust Architecture",
    sectionId: "zero-trust",
    priority: "P1",
    frameworkRefs: [
      { framework: "NIST CSF 2.0", controlId: "PR.AC-01", title: "Identity Management" },
      { framework: "CIS Controls v8", controlId: "6.1", title: "Establish Access Granting Process" }
    ],
    implementationNotes: "Deploy user-ID mapping agents syncing Active Directory / Okta logon sessions with firewall session state tables.",
    verificationMethod: "Inspect live IPS alert stream; confirm user identity attribute is populated for all internal subnet traffic."
  },
  {
    id: "IPP-ZT-02",
    title: "Microsegmentation Inter-Zone Inspection",
    description: "Enforce granular microsegmentation boundaries with inline IPS inspection between all application tiers and developer environments.",
    section: "Zero Trust Architecture",
    sectionId: "zero-trust",
    priority: "P1",
    frameworkRefs: [
      { framework: "CIS Controls v8", controlId: "12.2", title: "Architecture Segmentation" },
      { framework: "MITRE ATT&CK", controlId: "T1046", title: "Network Service Discovery" }
    ],
    implementationNotes: "Block all unauthorized inter-VLAN traversal; drop lateral port scanning and service probing immediately.",
    verificationMethod: "Attempt to initiate unauthorized SSH connection from corporate workstation subnet directly to production DB cluster."
  },
  {
    id: "IPP-ZT-03",
    title: "Continuous Verification & Anomaly Session Killing",
    description: "Continuously evaluate established TCP/UDP connections for behavioral shifts and terminate sessions immediately upon detection of anomalous exfiltration.",
    section: "Zero Trust Architecture",
    sectionId: "zero-trust",
    priority: "P2",
    frameworkRefs: [
      { framework: "NIST CSF 2.0", controlId: "DE.AE-02", title: "Anomalous Activity" }
    ],
    implementationNotes: "Send TCP RST packets or silent drops to both client and server upon detecting protocol anomalies or high-entropy data bursts.",
    verificationMethod: "Inject synthetic payload anomaly into active session; verify TCP RST is transmitted and connection closes within 100ms."
  },
  {
    id: "IPP-MET-01",
    title: "Comprehensive Program Coverage KPI Tracking",
    description: "Measure and report monthly on the percentage of enterprise perimeter gateways, data center fabrics, and cloud VPCs covered by active inline IPS.",
    section: "Metrics & Assurance",
    sectionId: "metrics",
    priority: "P2",
    frameworkRefs: [
      { framework: "NIST CSF 2.0", controlId: "GV.OC-01", title: "Oversight & Measurement" }
    ],
    implementationNotes: "Target >= 98% coverage across all corporate environments; uninspected enclaves require documented CISO risk exception.",
    verificationMethod: "Reconcile network topology asset database against active IPS management console sensor count monthly."
  },
  {
    id: "IPP-MET-02",
    title: "Efficacy & False-Positive SLA Governance",
    description: "Continuously monitor and govern key operational efficacy metrics: Block Rate for known threats (target > 99%), False-Positive rate (< 0.05%).",
    section: "Metrics & Assurance",
    sectionId: "metrics",
    priority: "P2",
    frameworkRefs: [
      { framework: "NIST SP 800-94", controlId: "Sec 4.3", title: "Effectiveness Monitoring" }
    ],
    implementationNotes: "Publish monthly executive scorecard tracking Mean Time to Promote (MTTP) high-priority signatures from Alert to Block mode.",
    verificationMethod: "Review monthly automated metric export generated from SIEM incident feedback records."
  },
  {
    id: "IPP-MET-03",
    title: "Annual Red Team & Simulation Assurance Exercises",
    description: "Execute bi-annual purple-team attack simulations and tabletop exercises to validate IPS containment playbooks and sensor detection fidelity.",
    section: "Metrics & Assurance",
    sectionId: "metrics",
    priority: "P2",
    frameworkRefs: [
      { framework: "NIST CSF 2.0", controlId: "RS.CO-03", title: "Exercise Response" },
      { framework: "CIS Controls v8", controlId: "17.3", title: "Perform Incident Response Exercises" }
    ],
    implementationNotes: "Utilize automated breach and attack simulation (BAS) tools executing Atomic Red Team tests across segmented zones.",
    verificationMethod: "Review post-exercise report detailing simulated ATT&CK techniques, detection percentage, and block efficacy."
  },
  {
    id: "IPP-EMG-01",
    title: "Encrypted Traffic Inspection & TLS Analytics",
    description: "Deploy selective TLS/SSL forward proxy decryption on outbound web gateways and utilize Encrypted Traffic Analytics (ETA) for privacy-sensitive flows.",
    section: "Emerging Considerations",
    sectionId: "emerging",
    priority: "P2",
    frameworkRefs: [
      { framework: "NIST SP 800-94", controlId: "Sec 3.5", title: "Encrypted Traffic Inspection" },
      { framework: "MITRE ATT&CK", controlId: "T1071.001", title: "Web Protocols (Encrypted C2)" }
    ],
    implementationNotes: "Exclude healthcare and financial categories from decryption to maintain regulatory privacy compliance (HIPAA/GLBA).",
    verificationMethod: "Verify SSL decryption certificates pushed to endpoints; inspect decrypted traffic logs for HTTP header visibility."
  },
  {
    id: "IPP-EMG-02",
    title: "AI/ML Behavioral Anomaly Detection",
    description: "Augment deterministic signature engines with unsupervised machine learning models to detect novel zero-day beaconing and lateral reconnaissance.",
    section: "Emerging Considerations",
    sectionId: "emerging",
    priority: "P2",
    frameworkRefs: [
      { framework: "NIST CSF 2.0", controlId: "DE.AE-01", title: "Anomalies are Detected" }
    ],
    implementationNotes: "Deploy models tracking baseline connection entropy, periodic beaconing intervals, and sudden volume outliers.",
    verificationMethod: "Run simulated low-and-slow beaconing script; verify behavioral anomaly engine flags pattern within 60 minutes."
  },
  {
    id: "IPP-EMG-03",
    title: "API & East-West Supply-Chain Inspection",
    description: "Integrate specialized API gateway inspection sensors at internal microservice borders to validate OpenAPI schema compliance and token security.",
    section: "Emerging Considerations",
    sectionId: "emerging",
    priority: "P2",
    frameworkRefs: [
      { framework: "NIST CSF 2.0", controlId: "PR.DS-02", title: "Data in Transit" }
    ],
    implementationNotes: "Block anomalous API requests violating schema constraints, unauthorized BOLA/IDOR parameters, or JWT tampering.",
    verificationMethod: "Transmit malformed API request violating OpenAPI schema; confirm 403 Forbidden generated by boundary sensor."
  },
  {
    id: "IPP-EMG-04",
    title: "Security-Policy-as-Code & IaC Pipeline Integration",
    description: "Store all IPS rule configurations, exception definitions, and sensor variables in Git, deploying updates via automated CI/CD pipelines.",
    section: "Emerging Considerations",
    sectionId: "emerging",
    priority: "P3",
    frameworkRefs: [
      { framework: "CIS Controls v8", controlId: "12.1", title: "Network Architecture" }
    ],
    implementationNotes: "Incorporate automated linting, syntax verification, and canary testing stages into the rule deployment pipeline.",
    verificationMethod: "Commit a test rule modification to Git; verify automated pipeline runs syntax checks and deploys to staging cluster."
  }
];

export const EMERGING_TOPICS: EmergingTopic[] = [
  {
    id: "EMG-TLS",
    title: "Encrypted Traffic Inspection & TLS 1.3 / ESNI",
    subtitle: "Navigating deep packet visibility in an increasingly opaque, encrypted network ecosystem.",
    category: "Cryptography & Visibility",
    impact: "Over 95% of enterprise web and C2 traffic is now encrypted with TLS 1.3. Traditional passive inspection is blinded without forward proxy decryption or behavioral metadata analytics.",
    architecturalPattern: "Dual-Path Architecture: Full TLS decryption for high-risk corporate egress using Enterprise Root CA certificates; Encrypted Traffic Analytics (ETA) utilizing packet length sequences, inter-arrival times, and initial handshake telemetry for privacy-exempt flows.",
    operationalRisks: [
      "Hardware latency and compute overhead when performing full TLS proxying.",
      "Legal and regulatory compliance violations if banking/medical employee traffic is decrypted (HIPAA, GDPR).",
      "Certificate pinning and client-side mutual TLS (mTLS) breaking legitimate business applications."
    ],
    recommendedControls: [
      "Deploy dedicated hardware SSL offloaders or utilize NGFW hardware crypto acceleration.",
      "Enforce explicit decryption exclusion lists for privacy-sensitive categories.",
      "Implement Encrypted Client Hello (ECH) inspection or fallback to Encrypted Traffic Analytics."
    ]
  },
  {
    id: "EMG-AIML",
    title: "AI/ML-Assisted Behavioral Anomaly Detection",
    subtitle: "Augmenting static signature matching with unsupervised machine learning models to detect zero-day exploits.",
    category: "Machine Learning & Analytics",
    impact: "Adversaries rapidly iterate malware variants and mutate exploit payloads to evade static regex signatures. AI models identify underlying behavioral intent regardless of obfuscation.",
    architecturalPattern: "Hybrid Engine: Fast deterministic signature engine handles known threats in microsecond line-rate; background stream processor runs streaming graph neural networks and autoencoders on flow vectors to flag anomalous beaconing and lateral movement.",
    operationalRisks: [
      "High false-positive rates during initial model training periods or sudden business traffic surges.",
      "Adversarial evasion attacks designed to gradually poison the normal baseline.",
      "Model opacity making root-cause explanation difficult for Tier 1 SOC analysts."
    ],
    recommendedControls: [
      "Require human-in-the-loop validation before granting autonomous blocking authority to ML models.",
      "Baseline models strictly on historical clean traffic; retrain models on a disciplined monthly schedule.",
      "Provide explainability scores detailing why an alert was flagged (e.g., entropy spike, beacon periodicity)."
    ]
  },
  {
    id: "EMG-API",
    title: "API & Microservice Supply-Chain Inspection",
    subtitle: "Protecting service-to-service communication and third-party API interconnects from software supply-chain poisoning.",
    category: "Application & API Security",
    impact: "East-West application traffic is dominated by JSON/REST, gRPC, and GraphQL APIs. Attackers exploit broken object level authorization (BOLA) and supply-chain dependencies to exfiltrate data silently.",
    architecturalPattern: "Service Mesh Sidecar Enforcement: Deploy lightweight IPS/WAF filters directly into Kubernetes Envoy sidecars to enforce OpenAPI specification schemas and validate JWT signatures at service boundaries.",
    operationalRisks: [
      "Breaking internal microservices when backend APIs introduce unannounced schema changes.",
      "Latency degradation in distributed microservice call graphs when deep JSON payload inspection is applied.",
      "Certificate rotation complexity across thousands of ephemeral container workloads."
    ],
    recommendedControls: [
      "Automate schema synchronization from developer OpenAPI / Swagger repositories into inspection proxies.",
      "Enforce strict mutual TLS (mTLS) with cryptographic identity verification (SPIFFE/SPIRE).",
      "Monitor for abnormal token replay and parameter manipulation across API gateways."
    ]
  },
  {
    id: "EMG-IAC",
    title: "Security-Policy-as-Code & Automated IaC Pipelines",
    subtitle: "Eliminating manual firewall tickets by versioning intrusion prevention rules within CI/CD pipelines.",
    category: "DevSecOps & Automation",
    impact: "Manual rule changes take days to review and are prone to human misconfiguration. Policy-as-Code allows rapid deployment of emergency zero-day blocks across global sensor fleets in minutes.",
    architecturalPattern: "GitOps Enforcement Pipeline: All sensor configurations, rule definitions, and exception lists are stored in Git. Changes trigger automated linting, test-suite validation, canary sensor deployment, and production rollout via Terraform/Ansible.",
    operationalRisks: [
      "A faulty rule committed without proper linting could trigger global false positives or disrupt production traffic.",
      "Merge conflict management across multiple engineering teams pushing concurrent changes.",
      "Pipeline credential leakage leading to unauthorized rule modification."
    ],
    recommendedControls: [
      "Enforce mandatory peer review (minimum 2 senior engineers) for any rule commit.",
      "Integrate automated syntax linters and canary test suites into GitHub Actions / GitLab CI.",
      "Implement automated rollback mechanisms if canary sensors report latency spikes or packet drops."
    ]
  }
];

export const SUMMARY_TABLE: SummaryRow[] = [
  {
    area: "Strategy & Principles",
    route: "/program",
    keyComponents: "Proactive intrusion mitigation, attacker dwell time reduction, least-privilege network behavior, omni-surface visibility.",
    standards: "NIST CSF 2.0 (PR, DE), NIST SP 800-94, Zero Trust (NIST SP 800-207)",
    criticalSuccessFactor: "Treat prevention as mandatory but maintain forensic readiness for every session."
  },
  {
    area: "Governance & Policy",
    route: "/program",
    keyComponents: "Authorized traffic baseline, default-deny boundaries, risk-based alert-to-block criteria, time-bound 90-day exception lifecycle.",
    standards: "CIS Controls v8 (12.1, 12.2), NIST SP 800-94 (Sec 4.2), ISO 27001",
    criticalSuccessFactor: "Zero permanent exceptions; executive sign-off required for any rule suppression."
  },
  {
    area: "Architecture & Placement",
    route: "/architecture",
    keyComponents: "Inline perimeter (North-South), tailored data center fabric (East-West), cloud VPC/Transit gateways, 802.1X/NAC, host HIPS/EDR.",
    standards: "NIST SP 800-94 (Sec 3.2-3.4), CIS Controls v8 (13.3, 13.8), MITRE ATT&CK",
    criticalSuccessFactor: "Do not clone perimeter rules internally; customize inspection per zone risk profile."
  },
  {
    area: "Deployment Lifecycle",
    route: "/lifecycle",
    keyComponents: "5-Stage Framework: Scope → Discover → Protect → Optimize → Maintain. Strict 7-day observation window before block mode.",
    standards: "NIST SP 800-94 (Sec 4), CIS Controls v8 (13.4, 13.6)",
    criticalSuccessFactor: "Deploy reputation filtering first; promote signatures in disciplined, validated batches."
  },
  {
    area: "SOC & IR Integration",
    route: "/soc",
    keyComponents: "Real-time CEF/JSON pipeline, SOAR automated enrichment, emergency 5-min containment playbooks, 90-day PCAP retention.",
    standards: "NIST CSF 2.0 (RS.MI, RS.AN), MITRE ATT&CK (T1190, T1071, T1021)",
    criticalSuccessFactor: "Direct bi-directional integration between Network IPS and Host EDR telemetry."
  },
  {
    area: "Zero Trust Architecture",
    route: "/zero-trust",
    keyComponents: "Identity-aware policy mapping (IdP integration), microsegmentation borders, continuous session verification, zero implicit trust.",
    standards: "NIST SP 800-207 (Zero Trust), CIS Controls v8 (12.2), CISA ZT Maturity Model",
    criticalSuccessFactor: "Terminate anomalous connections mid-stream even after successful authentication."
  },
  {
    area: "Metrics & Assurance",
    route: "/metrics",
    keyComponents: "Coverage KPIs (>= 98%), Efficacy (> 99% block, < 0.05% FP), sensor operational health SLAs, annual purple-team exercises.",
    standards: "NIST CSF 2.0 (GV.OC, DE.CM), CIS Controls v8 (17.3)",
    criticalSuccessFactor: "Continuous executive scorecard tracking Mean Time to Promote and alert hygiene."
  },
  {
    area: "Emerging Considerations",
    route: "/emerging",
    keyComponents: "Selective TLS 1.3 decryption & ETA, AI/ML behavioral anomaly detection, microservice API inspection, GitOps Policy-as-Code.",
    standards: "NIST SP 800-94 (Sec 3.5), OWASP API Top 10, Cloud Security Alliance (CSA)",
    criticalSuccessFactor: "Shift rule authoring into Infrastructure-as-Code pipelines with automated canary testing."
  }
];

export const KPIS_SUMMARY = [
  {
    label: "Total Hybrid Network Coverage",
    value: "98.4%",
    target: "98.0%",
    status: "optimal",
    change: "+1.2% this quarter",
    subtext: "Encompassing 48 Perimeter, DC & Cloud VPC Enclaves"
  },
  {
    label: "Known Malicious Block Rate",
    value: "99.4%",
    target: "99.0%",
    status: "optimal",
    change: "+0.3% vs baseline",
    subtext: "Validated against MITRE ATT&CK test suites"
  },
  {
    label: "False Positive Ratio",
    value: "0.021%",
    target: "< 0.05%",
    status: "optimal",
    change: "-0.008% reduction",
    subtext: "Across 2.8B inspected weekly connections"
  },
  {
    label: "Mean Time to Deploy (Critical Signatures)",
    value: "42 min",
    target: "< 120 min",
    status: "optimal",
    change: "78 min faster than SLA",
    subtext: "From vendor CVE disclosure to global inline enforcement"
  }
];

export const SAMPLE_CHART_DATA_MONTHLY = [
  { month: "Jun", inspectedGbps: 28, blockedEventsK: 840, falsePositiveRate: 0.048, signatureCurrencyHours: 3.2 },
  { month: "Jul", inspectedGbps: 31, blockedEventsK: 920, falsePositiveRate: 0.041, signatureCurrencyHours: 2.8 },
  { month: "Aug", inspectedGbps: 34, blockedEventsK: 1150, falsePositiveRate: 0.035, signatureCurrencyHours: 2.1 },
  { month: "Sep", inspectedGbps: 37, blockedEventsK: 1280, falsePositiveRate: 0.029, signatureCurrencyHours: 1.5 },
  { month: "Oct", inspectedGbps: 40, blockedEventsK: 1410, falsePositiveRate: 0.024, signatureCurrencyHours: 1.1 },
  { month: "Nov", inspectedGbps: 42, blockedEventsK: 1540, falsePositiveRate: 0.021, signatureCurrencyHours: 0.7 }
];

export const SAMPLE_CHART_DATA_ATTACK_DISTRIBUTION = [
  { name: "Web App Exploits (SQLi/XSS/RCE)", value: 38, color: "#06B6D4" },
  { name: "C2 Callback & Beaconing", value: 24, color: "#6366F1" },
  { name: "Reconnaissance & Port Sweeps", value: 18, color: "#F59E0B" },
  { name: "Internal Lateral Movement", value: 12, color: "#10B981" },
  { name: "Brute Force & Credential Access", value: 8, color: "#F43F5E" }
];

export const SAMPLE_CHART_DATA_ATTACK_COVERAGE = [
  { category: "Initial Access", covered: 94, target: 90 },
  { category: "Execution", covered: 88, target: 85 },
  { category: "Persistence", covered: 82, target: 80 },
  { category: "Privilege Escalation", covered: 85, target: 80 },
  { category: "Defense Evasion", covered: 91, target: 85 },
  { category: "Credential Access", covered: 96, target: 90 },
  { category: "Discovery", covered: 98, target: 95 },
  { category: "Lateral Movement", covered: 92, target: 90 },
  { category: "Command & Control", covered: 97, target: 95 },
  { category: "Exfiltration", covered: 89, target: 85 }
];

export const PROGRAM_METRICS_LIST: MetricItem[] = [
  {
    id: "MET-01",
    category: "Coverage",
    name: "Perimeter Enforcement Point Coverage",
    value: "100%",
    target: "100%",
    unit: "%",
    status: "optimal",
    description: "Percentage of public internet ingress/egress points routed through active inline IPS."
  },
  {
    id: "MET-02",
    category: "Coverage",
    name: "Internal Data Center Fabric Coverage",
    value: "96.5%",
    target: "95.0%",
    unit: "%",
    status: "optimal",
    description: "East-West inter-tier boundary inspection points operational across on-prem data centers."
  },
  {
    id: "MET-03",
    category: "Coverage",
    name: "Cloud VPC/VNet Inspection Coverage",
    value: "98.8%",
    target: "98.0%",
    unit: "%",
    status: "optimal",
    description: "Enterprise cloud workloads routed through Transit Gateway inspection VPC clusters."
  },
  {
    id: "MET-04",
    category: "Efficacy",
    name: "Known Threat Block Rate",
    value: "99.4%",
    target: "99.0%",
    unit: "%",
    status: "optimal",
    description: "Efficacy against verified malware payloads, exploit PoCs, and threat intelligence hashes."
  },
  {
    id: "MET-05",
    category: "Efficacy",
    name: "False Positive Ratio",
    value: "0.021%",
    target: "< 0.05%",
    unit: "%",
    status: "optimal",
    description: "Percentage of blocked or alerted sessions deemed benign after SOC investigation."
  },
  {
    id: "MET-06",
    category: "Efficacy",
    name: "Mean Time to Promote (Alert to Block)",
    value: "8.4 days",
    target: "< 14 days",
    unit: "days",
    status: "optimal",
    description: "Average days elapsed from initial staging alert deployment to production block authorization."
  },
  {
    id: "MET-07",
    category: "Operational Health",
    name: "Sensor Fleet Availability",
    value: "99.994%",
    target: "99.99%",
    unit: "%",
    status: "optimal",
    description: "Uptime across all physical and virtual inline IPS clusters with automated failover."
  },
  {
    id: "MET-08",
    category: "Operational Health",
    name: "Average Hardware Latency Overhead",
    value: "18 µs",
    target: "< 50 µs",
    unit: "µs",
    status: "optimal",
    description: "Packet processing delay introduced by inline deep packet inspection engines."
  },
  {
    id: "MET-09",
    category: "Operational Health",
    name: "Emergency Signature Deployment Time",
    value: "42 min",
    target: "< 120 min",
    unit: "min",
    status: "optimal",
    description: "Time elapsed from zero-day vendor signature release to active global enforcement."
  },
  {
    id: "MET-10",
    category: "SOC Integration",
    name: "Alert Triage Within SLA",
    value: "97.8%",
    target: "95.0%",
    unit: "%",
    status: "optimal",
    description: "High and Critical IPS alerts reviewed and triaged by SOC analysts within 15 minutes."
  },
  {
    id: "MET-11",
    category: "SOC Integration",
    name: "Incidents with IPS Containment",
    value: "84.2%",
    target: "80.0%",
    unit: "%",
    status: "optimal",
    description: "P1/P2 cybersecurity incidents where IPS automated or manual blocking provided containment."
  },
  {
    id: "MET-12",
    category: "SOC Integration",
    name: "PCAP Retention Compliance",
    value: "100%",
    target: "100%",
    unit: "%",
    status: "optimal",
    description: "Percentage of alerted sessions where full packet evidence was successfully archived for 90 days."
  }
];

// Helper to derive checklist items directly from controls
export function generateChecklist(): ChecklistItem[] {
  return CONTROLS.map(control => ({
    id: `chk-${control.id}`,
    controlId: control.id,
    section: control.section,
    sectionId: control.sectionId,
    title: control.title,
    description: control.description,
    priority: control.priority,
    frameworks: control.frameworkRefs.map(f => `${f.framework} (${f.controlId})`),
    implementationNotes: control.implementationNotes
  }));
}

// Global search index compiled from all entities
export function getSearchIndex() {
  const items: Array<{
    id: string;
    title: string;
    description: string;
    category: string;
    route: string;
    badge?: string;
  }> = [];

  // Sections
  SUMMARY_TABLE.forEach(row => {
    items.push({
      id: `sec-${row.area}`,
      title: row.area,
      description: row.keyComponents,
      category: "Program Section",
      route: row.route,
      badge: "Core Blueprint"
    });
  });

  // Controls
  CONTROLS.forEach(c => {
    items.push({
      id: c.id,
      title: `${c.id}: ${c.title}`,
      description: `${c.description} - ${c.implementationNotes}`,
      category: "Control",
      route: `/${c.sectionId}`,
      badge: c.priority
    });
  });

  // Architecture Nodes
  ARCHITECTURE_NODES.forEach(n => {
    items.push({
      id: n.id,
      title: `${n.name} (${n.direction})`,
      description: `${n.description} Focus: ${n.inspectionFocus.join(', ')}`,
      category: "Architecture Node",
      route: "/architecture",
      badge: n.layer
    });
  });

  // Lifecycle
  LIFECYCLE_STAGES.forEach(s => {
    items.push({
      id: s.id,
      title: `Stage ${s.step}: ${s.name} - ${s.tagline}`,
      description: s.objectives.join(' '),
      category: "Lifecycle Stage",
      route: "/lifecycle",
      badge: `Step ${s.step}`
    });
  });

  // SOC Use Cases
  SOC_USE_CASES.forEach(u => {
    items.push({
      id: u.id,
      title: `${u.id}: ${u.name}`,
      description: `${u.trigger} Correlation: ${u.correlationLogic}`,
      category: "SOC & Incident Response",
      route: "/soc",
      badge: u.severity
    });
  });

  // Zero Trust
  ZERO_TRUST_PILLARS.forEach(z => {
    items.push({
      id: z.id,
      title: z.title,
      description: `${z.description} Mechanism: ${z.technicalMechanism}`,
      category: "Zero Trust",
      route: "/zero-trust",
      badge: "Principle"
    });
  });

  // Frameworks
  FRAMEWORK_MAPPINGS.forEach(f => {
    items.push({
      id: f.id,
      title: `${f.framework}: ${f.controlRef} - ${f.frameworkTitle}`,
      description: f.ippCoverage,
      category: "Compliance Framework",
      route: "/frameworks",
      badge: f.coverageLevel
    });
  });

  // Emerging
  EMERGING_TOPICS.forEach(e => {
    items.push({
      id: e.id,
      title: e.title,
      description: `${e.subtitle} Impact: ${e.impact}`,
      category: "Emerging Considerations",
      route: "/emerging",
      badge: e.category
    });
  });

  return items;
}
