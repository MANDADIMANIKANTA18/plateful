package com.plateful.repository;

import com.plateful.model.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface OrderRepository extends JpaRepository<Order, UUID> {

    @Query("SELECT o FROM Order o JOIN FETCH o.listing l JOIN FETCH o.vendor v JOIN FETCH o.user u WHERE o.user.id = :userId ORDER BY o.createdAt DESC")
    List<Order> findByUserIdWithDetails(@Param("userId") UUID userId);

    @Query("SELECT o FROM Order o JOIN FETCH o.listing l JOIN FETCH o.vendor v JOIN FETCH o.user u WHERE o.vendor.id = :vendorId ORDER BY o.createdAt DESC")
    List<Order> findByVendorIdWithDetails(@Param("vendorId") UUID vendorId);

    /** Find an order by ID with all associations eagerly fetched */
    @Query("SELECT o FROM Order o JOIN FETCH o.listing l JOIN FETCH o.vendor v JOIN FETCH o.user u WHERE o.id = :orderId")
    Optional<Order> findByIdWithDetails(@Param("orderId") UUID orderId);

    /** Vendor analytics — aggregated directly from orders table (no view dependency) */
    @Query(value = "SELECT o.vendor_id as vendorId, COUNT(*) as totalOrders, " +
            "COALESCE(SUM(o.total_amount), 0) as totalRevenue, " +
            "DATE(o.created_at) as orderDate " +
            "FROM orders o " +
            "WHERE o.vendor_id = :vendorId AND o.order_status <> 'CANCELLED' " +
            "GROUP BY o.vendor_id, DATE(o.created_at) " +
            "ORDER BY DATE(o.created_at) DESC",
            nativeQuery = true)
    List<com.plateful.dto.VendorAnalyticsDTO> getVendorAnalytics(@Param("vendorId") UUID vendorId);

    /** Admin analytics — aggregated directly from orders table (no view dependency) */
    @Query(value = "SELECT o.vendor_id as vendorId, COUNT(*) as totalOrders, " +
            "COALESCE(SUM(o.total_amount), 0) as totalRevenue, " +
            "DATE(o.created_at) as orderDate " +
            "FROM orders o " +
            "WHERE o.order_status <> 'CANCELLED' " +
            "GROUP BY o.vendor_id, DATE(o.created_at) " +
            "ORDER BY DATE(o.created_at) DESC",
            nativeQuery = true)
    List<com.plateful.dto.VendorAnalyticsDTO> getAllAnalytics();
}
