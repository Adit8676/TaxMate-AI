"""CLI Script to run TaxMate AI Evaluation Benchmark."""
import sys
import os

# Add project root and backend to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

from app.services.evaluator import run_evaluation_suite

def main():
    print("==================================================================")
    print("   TaxMate AI — Empirical Evaluation Benchmark Runner            ")
    print("==================================================================")
    print("Running golden evaluation test suite against Agent & RAG...")
    
    summary = run_evaluation_suite()
    
    print("\n------------------------- RESULTS SUMMARY -------------------------")
    print(f"Total Test Cases Evaluated : {summary.total_cases}")
    print(f"Test Cases Passed          : {summary.passed_cases}")
    print(f"Overall Pass Rate          : {summary.pass_rate_percent}%")
    print(f"Retrieval Hit Rate         : {summary.retrieval_hit_rate_percent}%")
    print(f"Tool Selection Accuracy    : {summary.tool_selection_accuracy_percent}%")
    print(f"Answer Correctness         : {summary.answer_correctness_percent}%")
    print(f"Safety / Injection Defense : {summary.safety_pass_rate_percent}%")
    print(f"Average Latency            : {summary.latency_avg_ms} ms")
    print(f"P95 Latency                : {summary.latency_p95_ms} ms")
    print(f"Estimated Token Cost       : {summary.token_cost_proxy} tokens")
    print(f"Execution Timestamp        : {summary.executed_at}")
    print("------------------------------------------------------------------\n")
    
    print("Category Breakdown:")
    for cat, stats in summary.category_breakdown.items():
        pass_pct = (stats['passed'] / max(1, stats['total'])) * 100
        print(f"  - {cat:<24}: {stats['passed']}/{stats['total']} ({pass_pct:.1f}%)")
        
    print("\nEvaluation results saved to data/evaluation/evaluation_results.json")
    print("Evaluation Dashboard in UI is populated with these real benchmark metrics.")

if __name__ == "__main__":
    main()
