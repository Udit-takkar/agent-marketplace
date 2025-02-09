pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract ScamDetector is Ownable, Pausable {
    enum Severity { Low, Medium, High }
    enum ReportStatus { Pending, Confirmed, Rejected }

    struct ScamReport {
        address reporter;
        string scamType;
        Severity severity;
        address scammerAddress;
        string chain;
        string description;
        ReportStatus status;
        uint256 votes;
        uint256 timestamp;
    }

    mapping(bytes32 => ScamReport) public reports;
    mapping(address => uint256) public reporterReputations;
    mapping(bytes32 => mapping(address => bool)) public hasVoted;

    event ScamReported(
        address indexed reporter,
        string scamType,
        uint8 severity,
        bytes32 indexed reportId,
        string description
    );

    event EvidenceSubmitted(
        bytes32 indexed reportId,
        string evidenceType,
        bytes data
    );

    event PatternDetected(
        bytes32 patternId,
        address indexed scammer,
        uint256 confidence
    );

    event ReportStatusUpdated(
        bytes32 indexed reportId,
        ReportStatus status
    );

    event ReportVoted(
        bytes32 indexed reportId,
        address indexed voter,
        uint256 newVoteCount
    );

    uint256 public constant MINIMUM_REPUTATION = 10;
    uint256 public constant INITIAL_REPUTATION = 100;

    constructor() {
        _transferOwnership(msg.sender);
    }

    function submitScamReport(
        string memory scamType,
        Severity severity,
        address scammerAddress,
        string memory chain,
        string memory description
    ) external whenNotPaused returns (bytes32) {
        require(scammerAddress != address(0), "Invalid scammer address");
        require(bytes(description).length > 0, "Description required");

        // Initialize reporter reputation if first time
        if (reporterReputations[msg.sender] == 0) {
            reporterReputations[msg.sender] = INITIAL_REPUTATION;
        }

        bytes32 reportId = keccak256(
            abi.encodePacked(
                scammerAddress,
                scamType,
                block.timestamp,
                msg.sender
            )
        );

        reports[reportId] = ScamReport({
            reporter: msg.sender,
            scamType: scamType,
            severity: severity,
            scammerAddress: scammerAddress,
            chain: chain,
            description: description,
            status: ReportStatus.Pending,
            votes: 1,
            timestamp: block.timestamp
        });

        emit ScamReported(
            msg.sender,
            scamType,
            uint8(severity),
            reportId,
            description
        );

        return reportId;
    }

    function submitEvidence(
        bytes32 reportId,
        string memory evidenceType,
        bytes memory data
    ) external whenNotPaused {
        require(reports[reportId].timestamp != 0, "Report does not exist");
        require(bytes(evidenceType).length > 0, "Evidence type required");
        require(data.length > 0, "Evidence data required");

        emit EvidenceSubmitted(reportId, evidenceType, data);
    }

    function voteOnReport(bytes32 reportId) external whenNotPaused {
        require(reports[reportId].timestamp != 0, "Report does not exist");
        require(!hasVoted[reportId][msg.sender], "Already voted");
        require(
            reporterReputations[msg.sender] >= MINIMUM_REPUTATION,
            "Insufficient reputation"
        );

        hasVoted[reportId][msg.sender] = true;
        reports[reportId].votes += 1;

        emit ReportVoted(reportId, msg.sender, reports[reportId].votes);
    }

    function updateReportStatus(
        bytes32 reportId,
        ReportStatus newStatus
    ) external onlyOwner {
        require(reports[reportId].timestamp != 0, "Report does not exist");
        reports[reportId].status = newStatus;

        emit ReportStatusUpdated(reportId, newStatus);

        // Update reporter reputation based on report outcome
        if (newStatus == ReportStatus.Confirmed) {
            reporterReputations[reports[reportId].reporter] += 10;
        } else if (newStatus == ReportStatus.Rejected) {
            reporterReputations[reports[reportId].reporter] = reporterReputations[
                reports[reportId].reporter
            ] > 10 ? reporterReputations[reports[reportId].reporter] - 10 : 0;
        }
    }

    function reportPattern(
        bytes32 patternId,
        address scammer,
        uint256 confidence
    ) external onlyOwner {
        require(confidence <= 100, "Invalid confidence value");
        emit PatternDetected(patternId, scammer, confidence);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
} 