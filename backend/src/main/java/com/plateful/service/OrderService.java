package com.plateful.service;

import com.plateful.dto.order.CreateOrderRequest;
import com.plateful.dto.order.OrderResponse;
import com.plateful.model.entity.FoodListing;
import com.plateful.model.entity.Order;
import com.plateful.model.entity.User;
import com.plateful.model.enums.OrderStatus;
import com.plateful.model.enums.PaymentStatus;
import com.plateful.repository.FoodListingRepository;
import com.plateful.repository.OrderRepository;
import com.plateful.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final FoodListingRepository foodListingRepository;
    private final UserRepository userRepository;
    private final ImpactService impactService;

    @Transactional
    public OrderResponse createOrder(UUID userId, CreateOrderRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        FoodListing listing = foodListingRepository.findById(request.getListingId())
                .orElseThrow(() -> new IllegalArgumentException("Listing not found"));

        int available = listing.getQuantityAvailable() - listing.getQuantitySold();
        if (request.getQuantity() > available) {
            throw new IllegalArgumentException("Only " + available + " items available");
        }

        if (!listing.getIsActive()) {
            throw new IllegalArgumentException("Listing is no longer active");
        }

        BigDecimal totalAmount = listing.getSellingPrice().multiply(BigDecimal.valueOf(request.getQuantity()));

        String pickupCode = String.format("%06d", ThreadLocalRandom.current().nextInt(0, 999999));

        Order order = Order.builder()
                .user(user)
                .listing(listing)
                .vendor(listing.getVendor())
                .quantity(request.getQuantity())
                .unitPrice(listing.getSellingPrice())
                .totalAmount(totalAmount)
                .pickupCode(pickupCode)
                .orderStatus(OrderStatus.CONFIRMED) // Dummy payment setup
                .paymentStatus(PaymentStatus.PAID)
                .paymentId("dummy_txn_" + System.currentTimeMillis())
                .build();

        order = orderRepository.save(order);

        // Update quantity sold
        listing.setQuantitySold(listing.getQuantitySold() + request.getQuantity());
        foodListingRepository.save(listing);

        return toResponse(order);
    }

    public List<OrderResponse> getCustomerOrders(UUID userId) {
        return orderRepository.findByUserIdWithDetails(userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public List<OrderResponse> getVendorOrders(UUID vendorId) {
        return orderRepository.findByVendorIdWithDetails(vendorId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public List<com.plateful.dto.VendorAnalyticsDTO> getVendorAnalytics(UUID vendorId) {
        return orderRepository.getVendorAnalytics(vendorId);
    }

    public List<com.plateful.dto.VendorAnalyticsDTO> getAllAnalytics() {
        return orderRepository.getAllAnalytics();
    }

    @Transactional
    public OrderResponse confirmPayment(UUID orderId, String paymentId, String razorpayOrderId, String signature) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));

        order.setPaymentStatus(PaymentStatus.PAID);
        order.setOrderStatus(OrderStatus.CONFIRMED);
        order.setPaymentId(paymentId);
        order.setRazorpayOrderId(razorpayOrderId);
        order.setRazorpaySignature(signature);

        order = orderRepository.save(order);
        return toResponse(order);
    }

    @Transactional
    public OrderResponse completeOrder(UUID orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));

        order.setOrderStatus(OrderStatus.COMPLETED);
        order = orderRepository.save(order);

        // Update impact metrics
        impactService.recordCompletion(order.getQuantity(), order.getTotalAmount());

        return toResponse(order);
    }

    @Transactional
    public OrderResponse verifyPickupAndComplete(UUID orderId, String pickupCode) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));

        if (order.getOrderStatus() != OrderStatus.CONFIRMED) {
            throw new IllegalArgumentException("Order is not in CONFIRMED status");
        }

        if (order.getPickupCode() == null || !order.getPickupCode().equals(pickupCode)) {
            throw new IllegalArgumentException("Invalid pickup code");
        }

        order.setOrderStatus(OrderStatus.COMPLETED);
        order = orderRepository.save(order);

        // Update impact metrics
        impactService.recordCompletion(order.getQuantity(), order.getTotalAmount());

        return toResponse(order);
    }

    @Transactional
    public OrderResponse cancelOrder(UUID orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));

        if (order.getOrderStatus() == OrderStatus.COMPLETED) {
            throw new IllegalArgumentException("Cannot cancel a completed order");
        }

        order.setOrderStatus(OrderStatus.CANCELLED);
        if (order.getPaymentStatus() == PaymentStatus.PAID) {
            order.setPaymentStatus(PaymentStatus.REFUNDED);
        }

        // Restore stock
        FoodListing listing = order.getListing();
        listing.setQuantitySold(listing.getQuantitySold() - order.getQuantity());
        foodListingRepository.save(listing);

        order = orderRepository.save(order);
        return toResponse(order);
    }

    private OrderResponse toResponse(Order o) {
        FoodListing listing = o.getListing();
        return OrderResponse.builder()
                .id(o.getId())
                .userId(o.getUser().getId())
                .listingId(listing.getId())
                .vendorId(o.getVendor().getId())
                .foodName(listing.getFoodName())
                .restaurantName(o.getVendor().getRestaurantName())
                .quantity(o.getQuantity())
                .unitPrice(o.getUnitPrice())
                .totalAmount(o.getTotalAmount())
                .paymentStatus(o.getPaymentStatus().name())
                .orderStatus(o.getOrderStatus().name())
                .razorpayOrderId(o.getRazorpayOrderId())
                .pickupCode(o.getPickupCode())
                .pickupStartTime(listing.getPickupStartTime())
                .pickupEndTime(listing.getPickupEndTime())
                .createdAt(o.getCreatedAt())
                .build();
    }
}
