"""
Job Scraper Tool — Indonesian Job Market
Delegates semua pencarian ke Tavily (menggantikan DuckDuckGo).
Public function signatures tidak berubah — backward compatible.
"""
import logging
from tools.tavily_search import search_salary_tavily, search_growth_trends_tavily

logger = logging.getLogger(__name__)


def search_salary_trends(role: str) -> dict:
    """
    Cari data gaji untuk role di Indonesia.
    Returns: {min_idr, max_idr, median_idr, source_snippets}
    """
    return search_salary_tavily(role)


def search_growth_trends(role: str) -> dict:
    """
    Cari tren pertumbuhan demand untuk role.
    Returns: {trend_summary, growth_signal: "high"|"medium"|"low"}
    """
    return search_growth_trends_tavily(role)
